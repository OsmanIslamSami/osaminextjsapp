import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting FAQ and Magazine seeding...');

  // Get admin user for created_by/updated_by fields
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please run seed-admin-user script first.');
    process.exit(1);
  }

  console.log(`✓ Found admin user: ${adminUser.email}`);

  // Seed FAQs
  const faqsToCreate = [
    {
      question_en: 'What services do you offer?',
      question_ar: 'ما هي الخدمات التي تقدمونها؟',
      answer_en: 'We offer a comprehensive range of services including consulting, development, design, and support. Our team specializes in creating custom solutions tailored to your specific business needs.',
      answer_ar: 'نقدم مجموعة شاملة من الخدمات بما في ذلك الاستشارات والتطوير والتصميم والدعم. فريقنا متخصص في إنشاء حلول مخصصة مصممة خصيصًا لتلبية احتياجات عملك المحددة.',
      is_favorite: true,
      display_order: 1,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      question_en: 'How can I contact support?',
      question_ar: 'كيف يمكنني الاتصال بالدعم؟',
      answer_en: 'You can reach our support team via email at support@example.com or call us at +1 234 567 8900. We are available Monday through Friday, 9 AM to 6 PM EST.',
      answer_ar: 'يمكنك الوصول إلى فريق الدعم لدينا عبر البريد الإلكتروني على support@example.com أو الاتصال بنا على +1 234 567 8900. نحن متاحون من الاثنين إلى الجمعة ، من الساعة 9 صباحًا حتى الساعة 6 مساءً بتوقيت شرق الولايات المتحدة.',
      is_favorite: true,
      display_order: 2,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      question_en: 'Do you offer training services?',
      question_ar: 'هل تقدمون خدمات التدريب؟',
      answer_en: 'Yes, we provide comprehensive training programs for teams of all sizes. Our training covers technical skills, best practices, and hands-on workshops.',
      answer_ar: 'نعم ، نقدم برامج تدريبية شاملة لفرق من جميع الأحجام. يغطي تدريبنا المهارات التقنية وأفضل الممارسات وورش العمل العملية.',
      is_favorite: false,
      display_order: 3,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      question_en: 'What is your pricing model?',
      question_ar: 'ما هو نموذج التسعير الخاص بك؟',
      answer_en: 'Our pricing is flexible and based on project scope and requirements. We offer both fixed-price and time-and-materials models. Contact us for a custom quote.',
      answer_ar: 'تسعيرنا مرن ويعتمد على نطاق المشروع والمتطلبات. نحن نقدم نماذج السعر الثابت والوقت والمواد. اتصل بنا للحصول على عرض أسعار مخصص.',
      is_favorite: false,
      display_order: 4,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      question_en: 'How long does a typical project take?',
      question_ar: 'كم من الوقت يستغرق المشروع النموذجي؟',
      answer_en: 'Project timelines vary depending on complexity and scope. Small projects may take 2-4 weeks, while larger enterprise solutions can take 3-6 months or more. We provide detailed timelines during planning.',
      answer_ar: 'تختلف جداول المشروع حسب التعقيد والنطاق. قد تستغرق المشاريع الصغيرة 2-4 أسابيع ، بينما يمكن أن تستغرق حلول المؤسسة الأكبر 3-6 أشهر أو أكثر. نحن نقدم جداول زمنية مفصلة أثناء التخطيط.',
      is_favorite: false,
      display_order: 5,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
  ];

  console.log('\nCreating FAQs...');
  for (const faqData of faqsToCreate) {
    const faq = await prisma.fAQ.create({
      data: faqData
    });
    console.log(`✓ Created FAQ: ${faq.question_en}`);
  }

  // Seed Magazines
  const magazinesToCreate = [
    {
      title_en: 'Spring 2026 Edition',
      title_ar: 'إصدار ربيع 2026',
      description_en: 'Explore the latest trends in technology and innovation. This edition features interviews with industry leaders and in-depth analysis of emerging technologies.',
      description_ar: 'استكشف أحدث الاتجاهات في التكنولوجيا والابتكار. يتميز هذا الإصدار بمقابلات مع قادة الصناعة وتحليل متعمق للتقنيات الناشئة.',
      image_url: '/placeholders/magazine-placeholder.svg',
      storage_type: 'local',
      download_link: 'https://example.com/magazines/spring-2026.pdf',
      published_date: new Date('2026-03-01'),
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      title_en: 'Winter 2025 Edition',
      title_ar: 'إصدار شتاء 2025',
      description_en: 'Year in review: Major achievements and milestones from 2025. Featuring success stories from our clients and community members.',
      description_ar: 'مراجعة العام: الإنجازات والمعالم الرئيسية من عام 2025. تتميز بقصص نجاح من عملائنا وأعضاء مجتمعنا.',
      image_url: '/placeholders/magazine-placeholder.svg',
      storage_type: 'local',
      download_link: 'https://example.com/magazines/winter-2025.pdf',
      published_date: new Date('2025-12-01'),
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      title_en: 'Fall 2025 Edition',
      title_ar: 'إصدار خريف 2025',
      description_en: 'Special focus on digital transformation and cloud computing. Learn how businesses are adapting to the new digital landscape.',
      description_ar: 'تركيز خاص على التحول الرقمي والحوسبة السحابية. تعرف على كيفية تكيف الشركات مع المشهد الرقمي الجديد.',
      image_url: '/placeholders/magazine-placeholder.svg',
      storage_type: 'local',
      download_link: 'https://example.com/magazines/fall-2025.pdf',
      published_date: new Date('2025-09-01'),
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      title_en: 'Summer 2025 Edition',
      title_ar: 'إصدار صيف 2025',
      description_en: 'Explore sustainable technology solutions and green initiatives. Discover how technology can help build a more sustainable future.',
      description_ar: 'استكشف حلول التكنولوجيا المستدامة والمبادرات الخضراء. اكتشف كيف يمكن للتكنولوجيا أن تساعد في بناء مستقبل أكثر استدامة.',
      image_url: '/placeholders/magazine-placeholder.svg',
      storage_type: 'local',
      download_link: 'https://example.com/magazines/summer-2025.pdf',
      published_date: new Date('2025-06-01'),
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
    {
      title_en: 'Spring 2025 Edition',
      title_ar: 'إصدار ربيع 2025',
      description_en: 'Artificial Intelligence and Machine Learning breakthroughs. An in-depth look at how AI is transforming various industries.',
      description_ar: 'اختراقات الذكاء الاصطناعي والتعلم الآلي. نظرة متعمقة على كيفية تحويل الذكاء الاصطناعي لمختلف الصناعات.',
      image_url: '/placeholders/magazine-placeholder.svg',
      storage_type: 'local',
      download_link: 'https://example.com/magazines/spring-2025.pdf',
      published_date: new Date('2025-03-01'),
      created_by: adminUser.id,
      updated_by: adminUser.id,
    },
  ];

  console.log('\nCreating Magazines...');
  for (const magazineData of magazinesToCreate) {
    const magazine = await prisma.magazine.create({
      data: magazineData
    });
    console.log(`✓ Created Magazine: ${magazine.title_en}`);
  }

  // Create one deleted FAQ for testing soft-delete filtering
  const deletedFAQ = await prisma.fAQ.create({
    data: {
      question_en: 'This FAQ is deleted',
      question_ar: 'هذا السؤال محذوف',
      answer_en: 'This should not appear in the list.',
      answer_ar: 'يجب ألا يظهر هذا في القائمة.',
      is_favorite: false,
      is_deleted: true,
      display_order: 999,
      created_by: adminUser.id,
      updated_by: adminUser.id,
    }
  });
  console.log(`\n✓ Created deleted FAQ for testing: ${deletedFAQ.question_en}`);

  console.log('\n✅ Seeding completed successfully!');
  console.log(`\nSummary:`);
  console.log(`- Created ${faqsToCreate.length} FAQs (2 marked as favorites)`);
  console.log(`- Created ${magazinesToCreate.length} Magazines`);
  console.log(`- Created 1 deleted FAQ for testing soft-delete`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
