import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const newsDescriptions = [
  {
    id: 1,
    description_en: "Artificial Intelligence is revolutionizing the business landscape across industries. From automating routine tasks to providing deep insights through data analytics, AI technologies are enabling companies to operate more efficiently and make smarter decisions. This transformation is creating new opportunities for innovation and growth in unprecedented ways.",
    description_ar: "يُحدث الذكاء الاصطناعي ثورة في المشهد التجاري عبر الصناعات. من أتمتة المهام الروتينية إلى توفير رؤى عميقة من خلال تحليلات البيانات، تمكّن تقنيات الذكاء الاصطناعي الشركات من العمل بكفاءة أكبر واتخاذ قرارات أذكى. يخلق هذا التحول فرصًا جديدة للابتكار والنمو بطرق غير مسبوقة."
  },
  {
    id: 2,
    description_en: "Emerging markets present tremendous opportunities for businesses seeking global expansion. With rapidly growing economies, increasing digital adoption, and expanding middle classes, these markets offer untapped potential. Companies that strategically enter and navigate these regions can gain significant competitive advantages and access to new customer bases.",
    description_ar: "تقدم الأسواق الناشئة فرصًا هائلة للشركات الساعية إلى التوسع العالمي. مع الاقتصادات سريعة النمو، والتبني الرقمي المتزايد، وتوسع الطبقات المتوسطة، توفر هذه الأسواق إمكانات غير مستغلة. يمكن للشركات التي تدخل هذه المناطق وتتنقل فيها بشكل استراتيجي أن تكتسب مزايا تنافسية كبيرة والوصول إلى قواعد عملاء جديدة."
  },
  {
    id: 3,
    description_en: "Environmental sustainability has become a core business imperative. Going green in 2026 means implementing comprehensive sustainable practices across operations, from renewable energy adoption to circular economy principles. Companies leading this initiative are not only reducing their environmental impact but also discovering cost savings and enhanced brand reputation.",
    description_ar: "أصبحت الاستدامة البيئية ضرورة تجارية أساسية. التحول إلى الأخضر في عام 2026 يعني تنفيذ ممارسات مستدامة شاملة عبر العمليات، من اعتماد الطاقة المتجددة إلى مبادئ الاقتصاد الدائري. الشركات الرائدة في هذه المبادرة لا تقلل فقط من تأثيرها البيئي، بل تكتشف أيضًا توفيرات في التكاليف وتعزيز سمعة العلامة التجارية."
  },
  {
    id: 4,
    description_en: "Recognizing and celebrating outstanding team performance is essential for maintaining motivation and driving continuous improvement. Our Team Excellence Awards honor individuals and groups who have demonstrated exceptional dedication, innovation, and results. These achievements reflect our commitment to fostering a culture of excellence and collaboration.",
    description_ar: "إن التعرف على الأداء المتميز للفريق والاحتفال به أمر ضروري للحفاظ على الحافز ودفع التحسين المستمر. تكرم جوائز التميز لدينا الأفراد والمجموعات الذين أظهروا تفانيًا استثنائيًا وابتكارًا ونتائج. تعكس هذه الإنجازات التزامنا بتعزيز ثقافة التميز والتعاون."
  },
  {
    id: 5,
    description_en: "In an increasingly digital world, cybersecurity has become paramount. Protecting your digital assets requires implementing robust security measures, following best practices, and maintaining constant vigilance. From encryption and authentication to regular security audits, comprehensive protection strategies are essential for safeguarding sensitive information and maintaining trust.",
    description_ar: "في عالم رقمي متزايد، أصبح الأمن السيبراني أمرًا بالغ الأهمية. تتطلب حماية أصولك الرقمية تنفيذ تدابير أمنية قوية، واتباع أفضل الممارسات، والحفاظ على اليقظة المستمرة. من التشفير والمصادقة إلى عمليات التدقيق الأمني المنتظمة، تعد استراتيجيات الحماية الشاملة ضرورية لحماية المعلومات الحساسة والحفاظ على الثقة."
  },
  {
    id: 6,
    description_en: "Our Innovation Lab represents a bold step toward shaping the future of technology. By bringing together talented minds, cutting-edge resources, and collaborative spaces, we're creating an environment where breakthrough ideas can flourish. This initiative focuses on emerging technologies, experimental projects, and solutions that will define tomorrow's digital landscape.",
    description_ar: "يمثل مختبر الابتكار لدينا خطوة جريئة نحو تشكيل مستقبل التكنولوجيا. من خلال الجمع بين العقول الموهوبة والموارد المتطورة والمساحات التعاونية، نحن نخلق بيئة حيث يمكن للأفكار الرائدة أن تزدهر. تركز هذه المبادرة على التقنيات الناشئة والمشاريع التجريبية والحلول التي ستحدد مشهد الغد الرقمي."
  },
  {
    id: 7,
    description_en: "Digital transformation continues to reshape how businesses operate and compete. Organizations that embrace technology-driven change are seeing improved efficiency, enhanced customer experiences, and new revenue opportunities. The journey requires strategic planning, cultural adaptation, and commitment to continuous learning and evolution.",
    description_ar: "يواصل التحول الرقمي إعادة تشكيل كيفية عمل الشركات والمنافسة. المؤسسات التي تتبنى التغيير المدفوع بالتكنولوجيا تشهد تحسنًا في الكفاءة وتحسين تجارب العملاء وفرص إيرادات جديدة. تتطلب الرحلة التخطيط الاستراتيجي والتكيف الثقافي والالتزام بالتعلم والتطور المستمرين."
  },
  {
    id: 8,
    description_en: "Customer engagement in the digital age requires innovative approaches and personalized experiences. By leveraging data analytics, AI-powered insights, and omnichannel strategies, businesses can create meaningful connections with their audiences and build lasting relationships that drive loyalty and growth.",
    description_ar: "يتطلب مشاركة العملاء في العصر الرقمي أساليب مبتكرة وتجارب شخصية. من خلال الاستفادة من تحليلات البيانات والرؤى المدعومة بالذكاء الاصطناعي واستراتيجيات القنوات المتعددة، يمكن للشركات إنشاء روابط ذات مغزى مع جماهيرها وبناء علاقات دائمة تدفع الولاء والنمو."
  },
  {
    id: 9,
    description_en: "Remote work has fundamentally changed workplace dynamics. Successful organizations are investing in digital collaboration tools, flexible policies, and support systems that enable teams to thrive regardless of location. This shift represents both challenges and opportunities for reimagining work culture.",
    description_ar: "لقد غيّر العمل عن بُعد بشكل أساسي ديناميكيات مكان العمل. تستثمر المؤسسات الناجحة في أدوات التعاون الرقمي والسياسات المرنة وأنظمة الدعم التي تمكّن الفرق من الازدهار بغض النظر عن الموقع. يمثل هذا التحول تحديات وفرصًا لإعادة تخيل ثقافة العمل."
  },
  {
    id: 10,
    description_en: "Data-driven decision making has become essential for business success. By collecting, analyzing, and acting on quality data, organizations can gain competitive insights, optimize operations, and predict market trends. Building a data-centric culture empowers teams to make informed choices backed by evidence.",
    description_ar: "أصبح اتخاذ القرارات المستندة إلى البيانات ضروريًا لنجاح الأعمال. من خلال جمع البيانات عالية الجودة وتحليلها والتصرف بناءً عليها، يمكن للمؤسسات الحصول على رؤى تنافسية وتحسين العمليات والتنبؤ باتجاهات السوق. بناء ثقافة تتمحور حول البيانات يمكّن الفرق من اتخاذ خيارات مستنيرة مدعومة بالأدلة."
  }
];

async function updateNewsDescriptions() {
  console.log('🔄 Fetching existing news items...');
  
  // Get all news items from the database
  const existingNews = await prisma.news.findMany({
    where: {
      is_deleted: false
    },
    orderBy: {
      created_at: 'asc'
    },
    select: {
      id: true,
      title_en: true
    }
  });
  
  console.log(`📰 Found ${existingNews.length} news items\n`);
  
  if (existingNews.length === 0) {
    console.log('❌ No news items found in database');
    return;
  }
  
  // Update each news item with corresponding descriptions
  for (let i = 0; i < Math.min(existingNews.length, newsDescriptions.length); i++) {
    const newsItem = existingNews[i];
    const descriptions = newsDescriptions[i];
    
    console.log(`Updating: ${newsItem.title_en?.substring(0, 50) || 'Untitled'}...`);
    
    await prisma.news.update({
      where: { id: newsItem.id },
      data: {
        description_en: descriptions.description_en,
        description_ar: descriptions.description_ar,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Updated news item ${i + 1}/${existingNews.length}\n`);
  }
  
  console.log('✨ All news descriptions updated successfully!');
}

updateNewsDescriptions()
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error updating news descriptions:', error);
    prisma.$disconnect();
    process.exit(1);
  });
