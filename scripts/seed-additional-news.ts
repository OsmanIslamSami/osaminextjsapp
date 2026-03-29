import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding 40 additional news items...\n');

  const newsItems = [
    // Technology & Innovation (1-10)
    {
      title_en: 'Quantum Computing Breakthrough: New Era of Processing Power',
      title_ar: 'اختراق في الحوسبة الكمومية: عصر جديد من قوة المعالجة',
      description_en: 'Scientists have achieved a major breakthrough in quantum computing, demonstrating a system that can solve complex problems exponentially faster than classical computers. This advancement opens new possibilities in cryptography, drug discovery, and climate modeling.',
      description_ar: 'حقق العلماء اختراقًا كبيرًا في الحوسبة الكمومية، حيث أظهروا نظامًا يمكنه حل المشكلات المعقدة بشكل أسرع بشكل كبير من أجهزة الكمبيوتر الكلاسيكية. يفتح هذا التقدم إمكانيات جديدة في التشفير واكتشاف الأدوية ونمذجة المناخ.',
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-19'),
      is_visible: true,
    },
    {
      title_en: 'Blockchain Revolution: Transforming Supply Chain Management',
      title_ar: 'ثورة البلوكتشين: تحويل إدارة سلسلة التوريد',
      description_en: 'Companies are increasingly adopting blockchain technology to create transparent, efficient supply chains. The technology enables real-time tracking, reduces fraud, and ensures authenticity across global logistics networks.',
      description_ar: 'تتبنى الشركات بشكل متزايد تقنية البلوكتشين لإنشاء سلاسل توريد شفافة وفعالة. تتيح هذه التقنية التتبع في الوقت الفعلي، وتقلل الاحتيال، وتضمن الأصالة عبر شبكات اللوجستيات العالمية.',
      image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-18'),
      is_visible: true,
    },
    {
      title_en: '5G Network Expansion: Connecting the World at Lightning Speed',
      title_ar: 'توسع شبكة الجيل الخامس: ربط العالم بسرعة البرق',
      description_en: 'The global rollout of 5G networks continues to accelerate, bringing ultra-fast internet speeds and low latency to more regions. This infrastructure upgrade enables new applications in IoT, autonomous vehicles, and smart cities.',
      description_ar: 'يستمر النشر العالمي لشبكات الجيل الخامس في التسارع، مما يوفر سرعات إنترنت فائقة السرعة وزمن استجابة منخفض لمزيد من المناطق. يتيح هذا التحديث للبنية التحتية تطبيقات جديدة في إنترنت الأشياء والمركبات ذاتية القيادة والمدن الذكية.',
      image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-17'),
      is_visible: true,
    },
    {
      title_en: 'Machine Learning in Healthcare: Predicting Diseases Before Symptoms',
      title_ar: 'التعلم الآلي في الرعاية الصحية: التنبؤ بالأمراض قبل الأعراض',
      description_en: 'Advanced machine learning algorithms are now capable of detecting early signs of diseases from medical imaging and patient data. This predictive capability is revolutionizing preventive healthcare and improving patient outcomes.',
      description_ar: 'أصبحت خوارزميات التعلم الآلي المتقدمة الآن قادرة على اكتشاف العلامات المبكرة للأمراض من التصوير الطبي وبيانات المرضى. هذه القدرة التنبؤية تُحدث ثورة في الرعاية الصحية الوقائية وتحسن نتائج المرضى.',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-16'),
      is_visible: true,
    },
    {
      title_en: 'Virtual Reality Training: The Future of Corporate Learning',
      title_ar: 'التدريب بالواقع الافتراضي: مستقبل التعلم المؤسسي',
      description_en: 'Organizations are embracing VR technology for immersive training experiences. From safety protocols to customer service scenarios, virtual reality provides hands-on learning without real-world risks, significantly improving retention rates.',
      description_ar: 'تتبنى المؤسسات تقنية الواقع الافتراضي للحصول على تجارب تدريبية غامرة. من بروتوكولات السلامة إلى سيناريوهات خدمة العملاء، يوفر الواقع الافتراضي تعلمًا عمليًا دون مخاطر في العالم الحقيقي، مما يحسن معدلات الاحتفاظ بشكل كبير.',
      image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-15'),
      is_visible: true,
    },
    {
      title_en: 'Edge Computing: Processing Data Closer to the Source',
      title_ar: 'حوسبة الحافة: معالجة البيانات بالقرب من المصدر',
      description_en: 'Edge computing is transforming how we process data by bringing computation closer to data sources. This reduces latency, improves privacy, and enables real-time decision-making in IoT devices and autonomous systems.',
      description_ar: 'تحول حوسبة الحافة طريقة معالجة البيانات من خلال تقريب الحوسبة من مصادر البيانات. هذا يقلل من زمن الاستجابة، ويحسن الخصوصية، ويمكّن من اتخاذ القرارات في الوقت الفعلي في أجهزة إنترنت الأشياء والأنظمة الذاتية.',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-14'),
      is_visible: true,
    },
    {
      title_en: 'Augmented Reality in Retail: Try Before You Buy',
      title_ar: 'الواقع المعزز في التجزئة: جرب قبل أن تشتري',
      description_en: 'Retailers are leveraging AR technology to let customers visualize products in their own space before purchasing. This innovation is reducing return rates and increasing customer satisfaction across furniture, fashion, and home decor industries.',
      description_ar: 'يستفيد تجار التجزئة من تقنية الواقع المعزز للسماح للعملاء بتصور المنتجات في مساحتهم الخاصة قبل الشراء. يقلل هذا الابتكار من معدلات الإرجاع ويزيد من رضا العملاء عبر صناعات الأثاث والأزياء وديكور المنزل.',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-13'),
      is_visible: true,
    },
    {
      title_en: 'Cloud Migration Strategies: Moving to the Digital Sky',
      title_ar: 'استراتيجيات الانتقال السحابي: الانتقال إلى السماء الرقمية',
      description_en: 'Businesses are accelerating their cloud migration strategies to improve scalability, reduce costs, and enhance collaboration. Multi-cloud and hybrid approaches are becoming the standard for enterprise infrastructure.',
      description_ar: 'تعمل الشركات على تسريع استراتيجيات الانتقال السحابي لتحسين قابلية التوسع، وتقليل التكاليف، وتعزيز التعاون. أصبحت الأساليب متعددة السحابة والهجينة هي المعيار للبنية التحتية للمؤسسات.',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-12'),
      is_visible: true,
    },
    {
      title_en: 'Internet of Things: Smart Homes Become Mainstream',
      title_ar: 'إنترنت الأشياء: المنازل الذكية تصبح سائدة',
      description_en: 'Smart home technology has reached mainstream adoption with interconnected devices managing energy, security, and comfort. AI-powered systems learn user preferences and optimize home environments automatically.',
      description_ar: 'وصلت تقنية المنزل الذكي إلى التبني السائد مع الأجهزة المترابطة التي تدير الطاقة والأمن والراحة. تتعلم الأنظمة المدعومة بالذكاء الاصطناعي تفضيلات المستخدم وتحسن بيئات المنزل تلقائيًا.',
      image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-11'),
      is_visible: true,
    },
    {
      title_en: 'Digital Twins: Virtual Replicas Revolutionizing Manufacturing',
      title_ar: 'التوائم الرقمية: النسخ الافتراضية تُحدث ثورة في التصنيع',
      description_en: 'Manufacturers are creating digital twins of their facilities and products to simulate, predict, and optimize operations. This technology reduces downtime, improves quality control, and accelerates product development cycles.',
      description_ar: 'يقوم المصنعون بإنشاء توائم رقمية لمرافقهم ومنتجاتهم لمحاكاة العمليات والتنبؤ بها وتحسينها. تقلل هذه التقنية من وقت التوقف، وتحسن مراقبة الجودة، وتسرع دورات تطوير المنتجات.',
      image_url: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-10'),
      is_visible: true,
    },

    // Business & Finance (11-20)
    {
      title_en: 'Fintech Revolution: Digital Banking Transforms Financial Services',
      title_ar: 'ثورة التكنولوجيا المالية: الخدمات المصرفية الرقمية تحول الخدمات المالية',
      description_en: 'Digital-only banks and fintech platforms are reshaping the financial landscape with user-friendly interfaces, lower fees, and innovative services. Traditional banks are adapting or partnering to remain competitive in this new era.',
      description_ar: 'تعيد البنوك الرقمية فقط ومنصات التكنولوجيا المالية تشكيل المشهد المالي بواجهات سهلة الاستخدام ورسوم أقل وخدمات مبتكرة. تتكيف البنوك التقليدية أو تشارك للبقاء تنافسية في هذا العصر الجديد.',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-09'),
      is_visible: true,
    },
    {
      title_en: 'Cryptocurrency Adoption: Mainstream Acceptance Grows',
      title_ar: 'اعتماد العملات المشفرة: القبول السائد ينمو',
      description_en: 'Major corporations and financial institutions are integrating cryptocurrency into their operations. Regulatory clarity and improved infrastructure are driving broader adoption for payments and investments.',
      description_ar: 'تدمج الشركات الكبرى والمؤسسات المالية العملات المشفرة في عملياتها. الوضوح التنظيمي وتحسين البنية التحتية يدفعان إلى اعتماد أوسع للمدفوعات والاستثمارات.',
      image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-08'),
      is_visible: true,
    },
    {
      title_en: 'ESG Investing: Sustainability Drives Investment Decisions',
      title_ar: 'الاستثمار البيئي والاجتماعي والحوكمة: الاستدامة تقود قرارات الاستثمار',
      description_en: 'Environmental, Social, and Governance criteria are now central to investment strategies. Companies with strong ESG practices are attracting more capital and demonstrating superior long-term performance.',
      description_ar: 'أصبحت معايير البيئة والمجتمع والحوكمة الآن محورية لاستراتيجيات الاستثمار. الشركات ذات الممارسات القوية في هذا المجال تجذب المزيد من رأس المال وتظهر أداءً متفوقًا على المدى الطويل.',
      image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-07'),
      is_visible: true,
    },
    {
      title_en: 'E-commerce Evolution: Personalization and AI-Driven Shopping',
      title_ar: 'تطور التجارة الإلكترونية: التخصيص والتسوق المدفوع بالذكاء الاصطناعي',
      description_en: 'Online retailers are using AI to create hyper-personalized shopping experiences. From product recommendations to dynamic pricing, machine learning is optimizing every aspect of the customer journey.',
      description_ar: 'يستخدم تجار التجزئة عبر الإنترنت الذكاء الاصطناعي لإنشاء تجارب تسوق مخصصة للغاية. من توصيات المنتجات إلى التسعير الديناميكي، يعمل التعلم الآلي على تحسين كل جانب من جوانب رحلة العميل.',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-06'),
      is_visible: true,
    },
    {
      title_en: 'Startup Ecosystem: Record Funding for Innovative Ventures',
      title_ar: 'نظام الشركات الناشئة: تمويل قياسي للمشاريع المبتكرة',
      description_en: 'Venture capital investments in startups have reached new heights, particularly in sectors like AI, clean energy, and biotech. Angel investors and accelerator programs are fueling innovation worldwide.',
      description_ar: 'وصلت استثمارات رأس المال الجريء في الشركات الناشئة إلى مستويات جديدة، خاصة في قطاعات مثل الذكاء الاصطناعي والطاقة النظيفة والتكنولوجيا الحيوية. يغذي المستثمرون الملائكة وبرامج التسريع الابتكار في جميع أنحاء العالم.',
      image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-05'),
      is_visible: true,
    },
    {
      title_en: 'Remote Work Economy: New Business Models Emerge',
      title_ar: 'اقتصاد العمل عن بعد: نماذج أعمال جديدة تظهر',
      description_en: 'The shift to remote work has spawned new industries and business models. Co-working spaces, digital nomad services, and remote-first companies are reshaping how and where we work.',
      description_ar: 'أدى التحول إلى العمل عن بعد إلى ظهور صناعات ونماذج أعمال جديدة. المساحات المشتركة، وخدمات الرحل الرقميين، والشركات التي تعمل عن بعد أولاً تعيد تشكيل كيف وأين نعمل.',
      image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-04'),
      is_visible: true,
    },
    {
      title_en: 'Supply Chain Resilience: Lessons from Global Disruptions',
      title_ar: 'مرونة سلسلة التوريد: دروس من الاضطرابات العالمية',
      description_en: 'Companies are rebuilding supply chains with focus on resilience and redundancy. Near-shoring, diversification, and technology integration are key strategies for mitigating future disruptions.',
      description_ar: 'تعيد الشركات بناء سلاسل التوريد مع التركيز على المرونة والتكرار. التقريب الجغرافي، والتنويع، ودمج التكنولوجيا هي استراتيجيات رئيسية للتخفيف من الاضطرابات المستقبلية.',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-03'),
      is_visible: true,
    },
    {
      title_en: 'Subscription Economy: From Ownership to Access',
      title_ar: 'اقتصاد الاشتراك: من الملكية إلى الوصول',
      description_en: 'Consumer preferences are shifting from ownership to subscription-based access across industries. From software to cars, the subscription model offers flexibility and predictable revenue for businesses.',
      description_ar: 'تتحول تفضيلات المستهلكين من الملكية إلى الوصول القائم على الاشتراك عبر الصناعات. من البرامج إلى السيارات، يوفر نموذج الاشتراك المرونة والإيرادات المتوقعة للشركات.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-02'),
      is_visible: true,
    },
    {
      title_en: 'Corporate Social Responsibility: Beyond Profit Maximization',
      title_ar: 'المسؤولية الاجتماعية للشركات: ما وراء تعظيم الأرباح',
      description_en: 'Modern corporations are embracing broader stakeholder responsibility, balancing profit with social and environmental impact. This shift is driven by consumer expectations and regulatory pressure.',
      description_ar: 'تتبنى الشركات الحديثة مسؤولية أوسع تجاه أصحاب المصلحة، موازنة الربح مع التأثير الاجتماعي والبيئي. يتم دفع هذا التحول من خلال توقعات المستهلكين والضغط التنظيمي.',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-01'),
      is_visible: true,
    },
    {
      title_en: 'Gig Economy Growth: Flexible Work Arrangements Expand',
      title_ar: 'نمو اقتصاد العمل المؤقت: توسع ترتيبات العمل المرنة',
      description_en: 'The gig economy continues to grow as workers seek flexibility and companies access specialized talent on-demand. Platforms connecting freelancers with opportunities are proliferating across all sectors.',
      description_ar: 'يستمر اقتصاد العمل المؤقت في النمو حيث يسعى العمال إلى المرونة وتصل الشركات إلى المواهب المتخصصة عند الطلب. تتكاثر المنصات التي تربط المستقلين بالفرص عبر جميع القطاعات.',
      image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-28'),
      is_visible: true,
    },

    // Environment & Energy (21-30)
    {
      title_en: 'Renewable Energy Milestone: Solar Power Reaches Cost Parity',
      title_ar: 'معلم الطاقة المتجددة: الطاقة الشمسية تصل إلى تكافؤ التكلفة',
      description_en: 'Solar energy has achieved cost parity with fossil fuels in most markets, accelerating the transition to clean energy. Improved technology and economies of scale are driving this historic shift.',
      description_ar: 'حققت الطاقة الشمسية تكافؤ التكلفة مع الوقود الأحفوري في معظم الأسواق، مما يسرع الانتقال إلى الطاقة النظيفة. التكنولوجيا المحسنة ووفورات الحجم تدفع هذا التحول التاريخي.',
      image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-27'),
      is_visible: true,
    },
    {
      title_en: 'Electric Vehicles: Global Sales Surpass Traditional Cars',
      title_ar: 'السيارات الكهربائية: المبيعات العالمية تتجاوز السيارات التقليدية',
      description_en: 'Electric vehicle sales have overtaken traditional combustion engines in major markets. Improved battery technology, charging infrastructure, and government incentives are driving this transformation.',
      description_ar: 'تجاوزت مبيعات السيارات الكهربائية محركات الاحتراق التقليدية في الأسواق الرئيسية. تكنولوجيا البطاريات المحسنة، والبنية التحتية للشحن، والحوافز الحكومية تدفع هذا التحول.',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-26'),
      is_visible: true,
    },
    {
      title_en: 'Carbon Capture Technology: Removing CO2 from the Atmosphere',
      title_ar: 'تقنية احتجاز الكربون: إزالة ثاني أكسيد الكربون من الغلاف الجوي',
      description_en: 'Direct air capture technology is becoming commercially viable, offering a tool to combat climate change. Companies are scaling up facilities to remove millions of tons of CO2 annually.',
      description_ar: 'أصبحت تقنية احتجاز الهواء المباشر قابلة للتطبيق تجاريًا، مما يوفر أداة لمكافحة تغير المناخ. تقوم الشركات بتوسيع المرافق لإزالة ملايين الأطنان من ثاني أكسيد الكربون سنويًا.',
      image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-25'),
      is_visible: true,
    },
    {
      title_en: 'Sustainable Agriculture: Vertical Farms Feed Growing Cities',
      title_ar: 'الزراعة المستدامة: المزارع العمودية تغذي المدن المتنامية',
      description_en: 'Urban vertical farming is revolutionizing food production with year-round harvests, minimal water usage, and zero pesticides. This technology addresses food security while reducing environmental impact.',
      description_ar: 'تُحدث الزراعة العمودية الحضرية ثورة في إنتاج الغذاء مع الحصاد على مدار العام، والحد الأدنى من استخدام المياه، وعدم استخدام المبيدات. تعالج هذه التقنية الأمن الغذائي مع تقليل التأثير البيئي.',
      image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-24'),
      is_visible: true,
    },
    {
      title_en: 'Ocean Cleanup: Innovative Solutions for Plastic Pollution',
      title_ar: 'تنظيف المحيطات: حلول مبتكرة لتلوث البلاستيك',
      description_en: 'New technologies are successfully removing plastic waste from oceans at unprecedented scales. Autonomous systems and improved recycling methods are helping restore marine ecosystems.',
      description_ar: 'تزيل التقنيات الجديدة بنجاح النفايات البلاستيكية من المحيطات على نطاقات غير مسبوقة. تساعد الأنظمة الذاتية وطرق إعادة التدوير المحسنة في استعادة النظم البيئية البحرية.',
      image_url: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-23'),
      is_visible: true,
    },
    {
      title_en: 'Green Hydrogen: The Fuel of the Future Takes Off',
      title_ar: 'الهيدروجين الأخضر: وقود المستقبل ينطلق',
      description_en: 'Green hydrogen production is scaling rapidly as industries seek clean energy alternatives. This versatile fuel can decarbonize sectors like heavy industry, shipping, and aviation.',
      description_ar: 'يتوسع إنتاج الهيدروجين الأخضر بسرعة حيث تسعى الصناعات إلى بدائل الطاقة النظيفة. يمكن لهذا الوقود المتعدد الاستخدامات إزالة الكربون من قطاعات مثل الصناعة الثقيلة والشحن والطيران.',
      image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-22'),
      is_visible: true,
    },
    {
      title_en: 'Wildlife Conservation: Technology Protects Endangered Species',
      title_ar: 'حماية الحياة البرية: التكنولوجيا تحمي الأنواع المهددة بالانقراض',
      description_en: 'AI-powered monitoring systems, drones, and genetic technology are revolutionizing wildlife conservation efforts. These tools help track populations, combat poaching, and restore habitats.',
      description_ar: 'تُحدث أنظمة المراقبة المدعومة بالذكاء الاصطناعي، والطائرات بدون طيار، والتكنولوجيا الجينية ثورة في جهود حماية الحياة البرية. تساعد هذه الأدوات في تتبع السكان، ومكافحة الصيد الجائر، واستعادة الموائل.',
      image_url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-21'),
      is_visible: true,
    },
    {
      title_en: 'Circular Economy: Waste Becomes Resource in New Business Models',
      title_ar: 'الاقتصاد الدائري: النفايات تصبح موردًا في نماذج الأعمال الجديدة',
      description_en: 'Companies are adopting circular economy principles, designing products for reuse, repair, and recycling. This approach reduces waste, conserves resources, and creates new economic opportunities.',
      description_ar: 'تتبنى الشركات مبادئ الاقتصاد الدائري، وتصمم المنتجات لإعادة الاستخدام والإصلاح وإعادة التدوير. يقلل هذا النهج من النفايات، ويحفظ الموارد، ويخلق فرصًا اقتصادية جديدة.',
      image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-20'),
      is_visible: true,
    },
    {
      title_en: 'Reforestation Programs: Planting Billions of Trees Worldwide',
      title_ar: 'برامج إعادة التحريج: زراعة مليارات الأشجار في جميع أنحاء العالم',
      description_en: 'Global reforestation initiatives are planting billions of trees to combat climate change and restore ecosystems. Technology and community engagement are making these programs more effective than ever.',
      description_ar: 'تزرع مبادرات إعادة التحريج العالمية مليارات الأشجار لمكافحة تغير المناخ واستعادة النظم البيئية. تجعل التكنولوجيا ومشاركة المجتمع هذه البرامج أكثر فعالية من أي وقت مضى.',
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-19'),
      is_visible: true,
    },
    {
      title_en: 'Climate-Resilient Infrastructure: Building for a Changing World',
      title_ar: 'البنية التحتية المرنة للمناخ: البناء لعالم متغير',
      description_en: 'Cities are redesigning infrastructure to withstand climate change impacts. From flood-resistant buildings to heat-resistant materials, adaptation strategies are becoming standard practice.',
      description_ar: 'تعيد المدن تصميم البنية التحتية لتحمل تأثيرات تغير المناخ. من المباني المقاومة للفيضانات إلى المواد المقاومة للحرارة، أصبحت استراتيجيات التكيف ممارسة قياسية.',
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-18'),
      is_visible: true,
    },

    // Health & Wellness (31-40)
    {
      title_en: 'Personalized Medicine: DNA-Based Treatment Plans',
      title_ar: 'الطب الشخصي: خطط العلاج المستندة إلى الحمض النووي',
      description_en: 'Advances in genomics enable doctors to create personalized treatment plans based on individual DNA profiles. This precision medicine approach improves outcomes and reduces side effects.',
      description_ar: 'تمكن التطورات في علم الجينوم الأطباء من إنشاء خطط علاج شخصية بناءً على ملفات الحمض النووي الفردية. يحسن نهج الطب الدقيق هذا النتائج ويقلل من الآثار الجانبية.',
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-17'),
      is_visible: true,
    },
    {
      title_en: 'Telemedicine Expansion: Healthcare Access for Remote Areas',
      title_ar: 'توسع الطب عن بعد: الوصول إلى الرعاية الصحية للمناطق النائية',
      description_en: 'Telemedicine platforms are bringing quality healthcare to underserved populations. Virtual consultations, remote monitoring, and digital prescriptions are making healthcare more accessible.',
      description_ar: 'تجلب منصات الطب عن بعد الرعاية الصحية الجيدة للسكان المحرومين. الاستشارات الافتراضية، والمراقبة عن بعد، والوصفات الطبية الرقمية تجعل الرعاية الصحية أكثر سهولة.',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-16'),
      is_visible: true,
    },
    {
      title_en: 'Mental Health Revolution: Breaking the Stigma',
      title_ar: 'ثورة الصحة النفسية: كسر الوصمة',
      description_en: 'Society is increasingly prioritizing mental health with expanded services, workplace programs, and digital therapy platforms. Open conversations and better understanding are reducing stigma.',
      description_ar: 'يعطي المجتمع بشكل متزايد الأولوية للصحة النفسية مع توسيع الخدمات، وبرامج مكان العمل، ومنصات العلاج الرقمية. تقلل المحادثات المفتوحة والفهم الأفضل من الوصمة.',
      image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-15'),
      is_visible: true,
    },
    {
      title_en: 'Wearable Health Tech: Continuous Monitoring for Better Outcomes',
      title_ar: 'تقنية الصحة القابلة للارتداء: المراقبة المستمرة لنتائج أفضل',
      description_en: 'Advanced wearable devices now monitor vital signs, detect anomalies, and predict health issues before symptoms appear. This continuous health tracking is transforming preventive care.',
      description_ar: 'تراقب الأجهزة القابلة للارتداء المتقدمة الآن العلامات الحيوية، وتكتشف الشذوذ، وتتنبأ بالمشاكل الصحية قبل ظهور الأعراض. يحول هذا التتبع الصحي المستمر الرعاية الوقائية.',
      image_url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-14'),
      is_visible: true,
    },
    {
      title_en: 'Regenerative Medicine: Growing Organs in the Lab',
      title_ar: 'الطب التجديدي: زراعة الأعضاء في المختبر',
      description_en: 'Scientists are making breakthroughs in growing functional organs from stem cells. This technology could eliminate transplant waiting lists and save millions of lives.',
      description_ar: 'يحقق العلماء اختراقات في زراعة أعضاء وظيفية من الخلايا الجذعية. يمكن لهذه التقنية القضاء على قوائم انتظار الزرع وإنقاذ ملايين الأرواح.',
      image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-13'),
      is_visible: true,
    },
    {
      title_en: 'Nutrition Science: Understanding the Microbiome',
      title_ar: 'علم التغذية: فهم الميكروبيوم',
      description_en: 'Research into the gut microbiome is revolutionizing nutrition science. Personalized diet recommendations based on individual microbiome profiles are improving health outcomes.',
      description_ar: 'تُحدث الأبحاث في ميكروبيوم الأمعاء ثورة في علم التغذية. توصيات النظام الغذائي الشخصية بناءً على ملفات الميكروبيوم الفردية تحسن النتائج الصحية.',
      image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-12'),
      is_visible: true,
    },
    {
      title_en: 'Fitness Technology: AI Personal Trainers and Smart Gyms',
      title_ar: 'تقنية اللياقة البدنية: المدربون الشخصيون بالذكاء الاصطناعي والصالات الذكية',
      description_en: 'AI-powered fitness platforms and smart gym equipment provide personalized workout plans and real-time feedback. This technology is making professional training accessible to everyone.',
      description_ar: 'توفر منصات اللياقة البدنية المدعومة بالذكاء الاصطناعي ومعدات الصالات الرياضية الذكية خطط تمرين شخصية وملاحظات في الوقت الفعلي. تجعل هذه التقنية التدريب المهني في متناول الجميع.',
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-11'),
      is_visible: true,
    },
    {
      title_en: 'Sleep Science: Technology Helps Optimize Rest',
      title_ar: 'علم النوم: التكنولوجيا تساعد في تحسين الراحة',
      description_en: 'Advanced sleep tracking technology and research-backed interventions are helping millions improve sleep quality. Better sleep is linked to improved health, productivity, and wellbeing.',
      description_ar: 'تساعد تقنية تتبع النوم المتقدمة والتدخلات المدعومة بالأبحاث الملايين في تحسين جودة النوم. يرتبط النوم الأفضل بتحسين الصحة والإنتاجية والرفاهية.',
      image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-10'),
      is_visible: true,
    },
    {
      title_en: 'Aging Research: Extending Healthy Lifespan',
      title_ar: 'أبحاث الشيخوخة: تمديد العمر الصحي',
      description_en: 'Breakthroughs in longevity research are showing promise in extending not just lifespan, but healthspan. Interventions targeting cellular aging mechanisms could revolutionize how we age.',
      description_ar: 'تُظهر الاختراقات في أبحاث طول العمر وعدًا في تمديد ليس فقط العمر، ولكن فترة الصحة. يمكن للتدخلات التي تستهدف آليات الشيخوخة الخلوية أن تُحدث ثورة في كيفية شيخوختنا.',
      image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-09'),
      is_visible: true,
    },
    {
      title_en: 'Vaccine Innovation: mRNA Technology Beyond COVID-19',
      title_ar: 'ابتكار اللقاحات: تقنية mRNA ما وراء كوفيد-19',
      description_en: 'mRNA vaccine technology is being adapted to fight cancer, infectious diseases, and genetic disorders. This platform\'s versatility is opening new frontiers in preventive medicine.',
      description_ar: 'يتم تكييف تقنية لقاح mRNA لمكافحة السرطان والأمراض المعدية والاضطرابات الوراثية. تفتح تنوع هذه المنصة آفاقًا جديدة في الطب الوقائي.',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-02-08'),
      is_visible: true,
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const newsData of newsItems) {
    try {
      const news = await prisma.news.create({
        data: newsData,
      });
      console.log(`✅ Created: ${news.title_en?.substring(0, 60)}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error creating news: ${newsData.title_en}`);
      console.error(error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} news items`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📰 Total in database: ${await prisma.news.count()} news items`);
}

main()
  .then(() => prisma.$disconnect())
  .then(() => {
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding news:', error);
    prisma.$disconnect();
    process.exit(1);
  });
