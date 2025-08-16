import { PrismaClient, OrgTier, UserRole, DocumentStatus, AnalysisStatus, ClauseRisk } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.suggestion.deleteMany();
  await prisma.clause.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.page.deleteMany();
  await prisma.document.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.billingCustomer.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create Solo user with personal workspace
  const soloUser = await prisma.user.create({
    data: {
      email: 'solo@example.com',
      name: 'Solo User',
      password: await bcrypt.hash('password123', 10),
      emailVerified: new Date(),
    },
  });

  const soloOrg = await prisma.organization.create({
    data: {
      name: `${soloUser.name}'s Workspace`,
      tier: OrgTier.SOLO,
      memberships: {
        create: {
          userId: soloUser.id,
          role: UserRole.OWNER,
        },
      },
    },
  });

  // Create Team organization with multiple users
  const teamOwner = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      name: 'Team Owner',
      password: await bcrypt.hash('password123', 10),
      emailVerified: new Date(),
    },
  });

  const teamMember = await prisma.user.create({
    data: {
      email: 'member@example.com',
      name: 'Team Member',
      password: await bcrypt.hash('password123', 10),
      emailVerified: new Date(),
    },
  });

  const teamOrg = await prisma.organization.create({
    data: {
      name: 'Acme Legal Services',
      tier: OrgTier.PRO,
      retentionDays: 90,
      memberships: {
        create: [
          {
            userId: teamOwner.id,
            role: UserRole.OWNER,
          },
          {
            userId: teamMember.id,
            role: UserRole.MEMBER,
          },
        ],
      },
    },
  });

  // Create sample document with analysis for team org
  const sampleDoc = await prisma.document.create({
    data: {
      orgId: teamOrg.id,
      title: 'Sample Service Agreement',
      status: DocumentStatus.COMPLETED,
      pageCount: 6,
      uploadSrc: 'sample-service-agreement.pdf',
      storageKey: 'documents/sample-123/original.pdf',
      sha256: 'abc123def456',
      createdById: teamOwner.id,
      pages: {
        create: Array.from({ length: 6 }, (_, i) => ({
          index: i,
          storageKey: `documents/sample-123/page-${i}.png`,
          text: `Sample text content for page ${i + 1}...`,
          confidenceAvg: 0.95,
          ocrJson: {
            words: [],
            confidence: 0.95,
          },
        })),
      },
    },
  });

  // Create completed analysis with clauses
  const analysis = await prisma.analysis.create({
    data: {
      documentId: sampleDoc.id,
      jurisdiction: 'US-CA',
      jurisdictionConfidence: 0.92,
      status: AnalysisStatus.COMPLETED,
      completedAt: new Date(),
      metricsJson: {
        processingTime: 45000,
        clausesFound: 12,
      },
      clauses: {
        create: [
          {
            type: 'Governing Law',
            risk: ClauseRisk.LOW,
            pageIndex: 5,
            startChar: 100,
            endChar: 250,
            text: 'This Agreement shall be governed by the laws of California...',
            rationale: 'Standard governing law clause for California jurisdiction.',
            sourcesJson: { kbRuleIds: ['CA-GOV-001'] },
            suggestions: {
              create: {
                summary: 'Governing law clause is standard',
                whyItMatters: 'Determines which state laws apply to disputes.',
                ask: 'Confirm California law is acceptable for your business.',
                rewriteOption: 'No changes recommended.',
                fallbackOption: 'Consider adding forum selection clause.',
              },
            },
          },
          {
            type: 'Limitation of Liability',
            risk: ClauseRisk.HIGH,
            pageIndex: 3,
            startChar: 500,
            endChar: 800,
            text: 'In no event shall either party be liable for any indirect damages...',
            rationale: 'Broad limitation may exclude important remedies.',
            sourcesJson: { kbRuleIds: ['CA-LIMIT-003'] },
            suggestions: {
              create: {
                summary: 'Liability limitations are very broad',
                whyItMatters: 'Could prevent recovery for significant losses.',
                ask: 'Request carve-outs for gross negligence and willful misconduct.',
                rewriteOption: 'Except for gross negligence or willful misconduct, in no event...',
                fallbackOption: 'Negotiate a liability cap at contract value.',
              },
            },
          },
          {
            type: 'Auto-Renewal',
            risk: ClauseRisk.MEDIUM,
            pageIndex: 2,
            startChar: 200,
            endChar: 400,
            text: 'This Agreement automatically renews for successive one-year terms...',
            rationale: 'Auto-renewal requires advance notice to cancel.',
            sourcesJson: { kbRuleIds: ['CA-RENEW-002'] },
            suggestions: {
              create: {
                summary: 'Auto-renewal requires 60-day notice',
                whyItMatters: 'You may be locked in if you miss the notice window.',
                ask: 'Reduce notice period to 30 days or remove auto-renewal.',
                rewriteOption: 'Either party may terminate with 30 days written notice...',
                fallbackOption: 'Add calendar reminder 90 days before renewal date.',
              },
            },
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Test accounts created:');
  console.log('  Solo User: solo@example.com / password123');
  console.log('  Team Owner: owner@example.com / password123');
  console.log('  Team Member: member@example.com / password123');
  console.log('');
  console.log(`Sample document created: ${sampleDoc.title}`);
  console.log(`Sample analysis created with ${await prisma.clause.count({ where: { analysisId: analysis.id } })} clauses`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });