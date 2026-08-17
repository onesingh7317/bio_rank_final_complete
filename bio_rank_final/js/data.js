/* ============================================================
   data.js — Mock data for Bio Rank NEET Biology Platform
   Replace API calls here when backend is ready.
   ============================================================ */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}
window.escapeHtml = escapeHtml;

const DB = {

  /* ---- Biology Chapters ---- */
  chapters: [
    { id: 'ch01', name: 'Cell: The Unit of Life',        icon: '🔬', questions: 42, class: '11', weightage: 8  },
    { id: 'ch02', name: 'Cell Division',                  icon: '⚙️', questions: 38, class: '11', weightage: 7  },
    { id: 'ch03', name: 'Biomolecules',                   icon: '🧬', questions: 35, class: '11', weightage: 7  },
    { id: 'ch04', name: 'Photosynthesis',                 icon: '🌿', questions: 40, class: '11', weightage: 8  },
    { id: 'ch05', name: 'Respiration in Plants',          icon: '💨', questions: 30, class: '11', weightage: 6  },
    { id: 'ch06', name: 'Plant Growth & Development',     icon: '🌱', questions: 28, class: '11', weightage: 5  },
    { id: 'ch07', name: 'Digestion & Absorption',         icon: '🫁', questions: 36, class: '11', weightage: 7  },
    { id: 'ch08', name: 'Breathing & Gas Exchange',       icon: '🫀', questions: 32, class: '11', weightage: 6  },
    { id: 'ch09', name: 'Body Fluids & Circulation',      icon: '🩸', questions: 38, class: '11', weightage: 7  },
    { id: 'ch10', name: 'Excretory Products & Processes', icon: '🧪', questions: 34, class: '11', weightage: 6  },
    { id: 'ch11', name: 'Locomotion & Movement',          icon: '🦴', questions: 28, class: '11', weightage: 5  },
    { id: 'ch12', name: 'Neural Control & Coordination',  icon: '🧠', questions: 40, class: '11', weightage: 8  },
    { id: 'ch13', name: 'Chemical Coordination',          icon: '⚗️', questions: 35, class: '11', weightage: 7  },
    { id: 'ch14', name: 'Reproduction in Organisms',      icon: '🌸', questions: 30, class: '12', weightage: 6  },
    { id: 'ch15', name: 'Sexual Reproduction in Plants',  icon: '🌺', questions: 38, class: '12', weightage: 7  },
    { id: 'ch16', name: 'Human Reproduction',             icon: '👶', questions: 42, class: '12', weightage: 8  },
    { id: 'ch17', name: 'Reproductive Health',            icon: '🏥', questions: 28, class: '12', weightage: 5  },
    { id: 'ch18', name: 'Principles of Inheritance',      icon: '🧩', questions: 44, class: '12', weightage: 9  },
    { id: 'ch19', name: 'Molecular Basis of Inheritance', icon: '🔗', questions: 46, class: '12', weightage: 9  },
    { id: 'ch20', name: 'Evolution',                      icon: '🦎', questions: 30, class: '12', weightage: 5  },
    { id: 'ch21', name: 'Human Health & Disease',         icon: '💊', questions: 38, class: '12', weightage: 7  },
    { id: 'ch22', name: 'Strategies for Enhancement',     icon: '🌾', questions: 28, class: '12', weightage: 5  },
    { id: 'ch23', name: 'Microbes in Human Welfare',      icon: '🦠', questions: 26, class: '12', weightage: 4  },
    { id: 'ch24', name: 'Biotechnology: Principles',      icon: '💡', questions: 36, class: '12', weightage: 7  },
    { id: 'ch25', name: 'Biotechnology & Applications',   icon: '🔬', questions: 34, class: '12', weightage: 6  },
    { id: 'ch26', name: 'Organisms & Populations',        icon: '🌏', questions: 30, class: '12', weightage: 5  },
    { id: 'ch27', name: 'Ecosystem',                      icon: '🌳', questions: 32, class: '12', weightage: 6  },
    { id: 'ch28', name: 'Biodiversity & Conservation',    icon: '🐾', questions: 28, class: '12', weightage: 5  },
  ],

  /* ---- Full Length Tests (complete NEET Biology mock tests).
     Centralized mock/static list — the Full Length Test page maps over
     this array, so adding more entries here (e.g. once an admin upload
     system exists) automatically makes them appear on the page. ---- */
  fullLengthTests: [
    { id: 'flt01', title: 'Full Length Test 1', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt02', title: 'Full Length Test 2', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt03', title: 'Full Length Test 3', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt04', title: 'Full Length Test 4', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
    { id: 'flt05', title: 'Full Length Test 5', description: 'Complete Biology Mock Test', numberOfQuestions: 90, durationMinutes: 90 },
  ],

  /* ---- PYQ Years (legacy year-wise data — kept for reference/rollback.
     The PYQ Test page now uses chapter-wise navigation (see `chapters`
     above); this array is no longer read by renderPYQTest but is left
     intact since removing it wasn't required and other work may still
     reference it.) ---- */
  pyqYears: [
    { id: 'pyq2024', year: 2024, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2023', year: 2023, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2022', year: 2022, shifts: ['Shift 1', 'Shift 2', 'Shift 3'], questions: 90 },
    { id: 'pyq2021', year: 2021, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2020', year: 2020, shifts: ['Shift 1', 'Shift 2'], questions: 90 },
    { id: 'pyq2019', year: 2019, shifts: ['Shift 1'], questions: 90 },
  ],

  /* ---- Sub-skills ---- */
  subSkills: [
    { id: 'ss01', name: 'Cell organelle functions',       chapter: 'ch01', bloomLevel: 'understand' },
    { id: 'ss02', name: 'Mitosis stages & significance',  chapter: 'ch02', bloomLevel: 'understand' },
    { id: 'ss03', name: 'Meiosis & genetic variation',    chapter: 'ch02', bloomLevel: 'analyze'    },
    { id: 'ss04', name: 'Enzyme kinetics',                chapter: 'ch03', bloomLevel: 'apply'      },
    { id: 'ss05', name: 'Light reaction steps (Z-scheme)',chapter: 'ch04', bloomLevel: 'analyze'    },
    { id: 'ss06', name: 'Calvin cycle intermediates',     chapter: 'ch04', bloomLevel: 'remember'   },
    { id: 'ss07', name: 'Krebs cycle yield calculation',  chapter: 'ch05', bloomLevel: 'apply'      },
    { id: 'ss08', name: 'Neurotransmitter mechanisms',    chapter: 'ch12', bloomLevel: 'understand' },
    { id: 'ss09', name: 'Hormonal feedback loops',        chapter: 'ch13', bloomLevel: 'analyze'    },
    { id: 'ss10', name: 'Mendelian genetics problems',    chapter: 'ch18', bloomLevel: 'apply'      },
    { id: 'ss11', name: 'DNA replication enzymes',        chapter: 'ch19', bloomLevel: 'remember'   },
    { id: 'ss12', name: 'Transcription & translation',    chapter: 'ch19', bloomLevel: 'understand' },
    { id: 'ss13', name: 'Pedigree analysis',              chapter: 'ch18', bloomLevel: 'analyze'    },
    { id: 'ss14', name: 'Blood clotting cascade',         chapter: 'ch09', bloomLevel: 'remember'   },
    { id: 'ss15', name: 'Nephron filtration dynamics',    chapter: 'ch10', bloomLevel: 'understand' },
  ],

  /* ---- Biology Questions Bank ---- */
  questions: [
    {
      id: 'q001', chapter: 'ch19', subSkill: 'ss11', bloomLevel: 'remember', weightage: 9, year: 2023,
      text: 'Which enzyme catalyzes the unwinding of DNA double helix during replication?',
      options: ['DNA Polymerase I', 'Helicase', 'Ligase', 'Primase'],
      correct: 1,
      explanation: 'Helicase breaks the hydrogen bonds between complementary base pairs and unwinds the DNA double helix at the replication fork.'
    },
    {
      id: 'q002', chapter: 'ch04', subSkill: 'ss05', bloomLevel: 'analyze', weightage: 8, year: 2022,
      text: 'In the Z-scheme of photosynthesis, which molecule serves as the primary electron donor to Photosystem II?',
      options: ['NADPH', 'Ferredoxin', 'Water (H₂O)', 'Plastoquinone'],
      correct: 2,
      explanation: 'Water is the primary electron donor to PS II. Its oxidation (photolysis) releases O₂, H⁺, and electrons.'
    },
    {
      id: 'q003', chapter: 'ch18', subSkill: 'ss10', bloomLevel: 'apply', weightage: 9, year: 2024,
      text: 'In a dihybrid cross between AaBb × aabb (Mendel\'s second law applies), what fraction of offspring will show both dominant traits?',
      options: ['1/16', '9/16', '1/4', '3/16'],
      correct: 2,
      explanation: 'AaBb × aabb gives 1 AaBb : 1 Aabb : 1 aaBb : 1 aabb. AaBb shows both dominant traits = 1/4.'
    },
    {
      id: 'q004', chapter: 'ch12', subSkill: 'ss08', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'Which neurotransmitter is primarily released at the neuromuscular junction to initiate skeletal muscle contraction?',
      options: ['Dopamine', 'Serotonin', 'Acetylcholine', 'Norepinephrine'],
      correct: 2,
      explanation: 'Acetylcholine (ACh) is released by motor neurons at the neuromuscular junction, binding to nicotinic receptors on the motor end plate.'
    },
    {
      id: 'q005', chapter: 'ch02', subSkill: 'ss02', bloomLevel: 'understand', weightage: 7, year: 2022,
      text: 'During which phase of mitosis do centromeres split and chromatids move to opposite poles?',
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      correct: 2,
      explanation: 'During Anaphase, centromeres split and sister chromatids are pulled to opposite poles by spindle fibers.'
    },
    {
      id: 'q006', chapter: 'ch05', subSkill: 'ss07', bloomLevel: 'apply', weightage: 6, year: 2021,
      text: 'How many ATP molecules are produced during one complete turn of the Krebs cycle (per acetyl-CoA)?',
      options: ['2', '12', '8', '10'],
      correct: 3,
      explanation: 'One turn of Krebs cycle produces: 3 NADH (×2.5 ATP = 7.5), 1 FADH₂ (×1.5 ATP = 1.5), 1 GTP = 1 ATP. Total ≈ 10 ATP.'
    },
    {
      id: 'q007', chapter: 'ch10', subSkill: 'ss15', bloomLevel: 'understand', weightage: 6, year: 2023,
      text: 'The juxtaglomerular apparatus (JGA) secretes renin in response to:',
      options: ['High blood pressure', 'High sodium in filtrate', 'Low blood pressure / low filtrate flow', 'High ADH levels'],
      correct: 2,
      explanation: 'JGA cells detect low blood pressure and low GFR, triggering renin secretion which initiates the RAAS to increase blood pressure.'
    },
    {
      id: 'q008', chapter: 'ch09', subSkill: 'ss14', bloomLevel: 'remember', weightage: 7, year: 2022,
      text: 'Which clotting factor is absent in haemophilia A?',
      options: ['Factor IX', 'Factor VIII', 'Factor XI', 'von Willebrand factor'],
      correct: 1,
      explanation: 'Haemophilia A is caused by deficiency of Factor VIII (anti-haemophilic factor), an essential clotting factor.'
    },
    {
      id: 'q009', chapter: 'ch19', subSkill: 'ss12', bloomLevel: 'understand', weightage: 9, year: 2024,
      text: 'Which RNA polymerase transcribes structural genes (mRNA) in eukaryotes?',
      options: ['RNA Polymerase I', 'RNA Polymerase II', 'RNA Polymerase III', 'Primase'],
      correct: 1,
      explanation: 'RNA Polymerase II transcribes mRNA (protein-coding genes) in eukaryotes. Pol I makes rRNA; Pol III makes tRNA and 5S rRNA.'
    },
    {
      id: 'q010', chapter: 'ch13', subSkill: 'ss09', bloomLevel: 'analyze', weightage: 7, year: 2023,
      text: 'In a negative feedback loop, rising blood glucose causes the pancreas to secrete insulin. Which of the following correctly describes the role of insulin?',
      options: [
        'Stimulates glucagon release to increase glycogenesis',
        'Promotes glucose uptake by cells and glycogen synthesis, lowering blood glucose',
        'Inhibits glucose uptake and promotes glycogenolysis',
        'Stimulates cortisol to raise blood glucose'
      ],
      correct: 1,
      explanation: 'Insulin promotes glucose uptake by peripheral cells (via GLUT4), glycogenesis, and inhibits gluconeogenesis — all of which lower blood glucose.'
    },
    {
      id: 'q011', chapter: 'ch01', subSkill: 'ss01', bloomLevel: 'understand', weightage: 8, year: 2022,
      text: 'Which organelle is responsible for the synthesis of proteins destined for secretion?',
      options: ['Free ribosomes', 'Rough endoplasmic reticulum', 'Smooth endoplasmic reticulum', 'Peroxisomes'],
      correct: 1,
      explanation: 'Rough ER (studded with ribosomes) synthesizes secretory proteins. These are then transported to the Golgi apparatus for modification and packaging.'
    },
    {
      id: 'q012', chapter: 'ch04', subSkill: 'ss06', bloomLevel: 'remember', weightage: 8, year: 2021,
      text: 'Which 3-carbon compound is the first stable product of the Calvin cycle (C3 photosynthesis)?',
      options: ['Oxaloacetate (OAA)', '3-Phosphoglycerate (3-PGA)', 'Ribulose-1,5-bisphosphate (RuBP)', 'Glyceraldehyde-3-phosphate (G3P)'],
      correct: 1,
      explanation: 'CO₂ is fixed by RuBisCO onto RuBP to form an unstable 6C compound which immediately splits into two molecules of 3-PGA (3-phosphoglycerate).'
    },
    {
      id: 'q013', chapter: 'ch18', subSkill: 'ss13', bloomLevel: 'analyze', weightage: 9, year: 2024,
      text: 'A pedigree shows a trait appearing in every generation with both males and females affected and unaffected parents having affected children. The most likely inheritance pattern is:',
      options: ['Autosomal recessive', 'X-linked recessive', 'Autosomal dominant', 'Mitochondrial inheritance'],
      correct: 2,
      explanation: 'Autosomal dominant traits appear in every generation, affect both sexes equally, and an affected individual has at least one affected parent.'
    },
    {
      id: 'q014', chapter: 'ch02', subSkill: 'ss03', bloomLevel: 'analyze', weightage: 7, year: 2022,
      text: 'Crossing over during meiosis occurs between non-sister chromatids of homologous chromosomes during:',
      options: ['Leptotene', 'Zygotene', 'Pachytene', 'Diplotene'],
      correct: 2,
      explanation: 'Crossing over (chiasmata formation) occurs during Pachytene of meiosis I prophase, when tetrads are fully formed and chromatids can exchange segments.'
    },
    {
      id: 'q015', chapter: 'ch03', subSkill: 'ss04', bloomLevel: 'apply', weightage: 7, year: 2023,
      text: 'At very high substrate concentrations, which factor most significantly limits enzyme-catalyzed reaction rate?',
      options: ['Substrate concentration', 'Product inhibition', 'Available enzyme (active sites)', 'Temperature below optimum'],
      correct: 2,
      explanation: 'At saturating substrate concentrations, all active sites are occupied — the reaction rate is at Vmax and is limited only by enzyme concentration.'
    },
    {
      id: 'q016', chapter: 'ch21', subSkill: 'ss16', bloomLevel: 'remember', weightage: 7, year: 2022,
      text: 'Which of the following is NOT an antigen presenting cell (APC) in the immune system?',
      options: ['Dendritic cell', 'Macrophage', 'B lymphocyte', 'Cytotoxic T cell'],
      correct: 3,
      explanation: 'Cytotoxic T cells (CD8⁺) kill infected cells; they are effector cells, not antigen presenting cells. APCs include dendritic cells, macrophages, and B cells.'
    },
    {
      id: 'q017', chapter: 'ch16', subSkill: 'ss17', bloomLevel: 'understand', weightage: 8, year: 2023,
      text: 'During which week of human embryonic development does implantation typically occur?',
      options: ['Week 1', 'End of week 1 / beginning of week 2', 'Week 3', 'Week 4'],
      correct: 1,
      explanation: 'The blastocyst implants in the uterine endometrium around day 6–10 (end of first week / start of second week) after fertilization.'
    },
    {
      id: 'q018', chapter: 'ch27', subSkill: 'ss18', bloomLevel: 'understand', weightage: 6, year: 2021,
      text: 'In a food chain, ecological efficiency is the percentage of energy transferred from one trophic level to the next. The typical value is:',
      options: ['1–2%', '10%', '50%', '90%'],
      correct: 1,
      explanation: 'Ecological or Lindeman\'s efficiency is approximately 10% — meaning only 10% of energy at one trophic level is available to the next.'
    },
    {
      id: 'q019', chapter: 'ch24', subSkill: 'ss19', bloomLevel: 'remember', weightage: 7, year: 2024,
      text: 'The enzyme used to cut DNA at specific sequences in recombinant DNA technology is called:',
      options: ['DNA ligase', 'Restriction endonuclease', 'Reverse transcriptase', 'Taq polymerase'],
      correct: 1,
      explanation: 'Restriction endonucleases (restriction enzymes) recognize specific palindromic sequences and cleave DNA. They are the "molecular scissors" of rDNA technology.'
    },
    {
      id: 'q020', chapter: 'ch19', subSkill: 'ss11', bloomLevel: 'understand', weightage: 9, year: 2023,
      text: 'Okazaki fragments are synthesized in which direction on the lagging strand during DNA replication?',
      options: ["3' to 5'", "5' to 3'", "Both directions", "Neither — they are joined without synthesis"],
      correct: 1,
      explanation: "DNA polymerase can only synthesize in the 5'→3' direction. On the lagging strand, short Okazaki fragments are synthesized 5'→3' in the direction away from the replication fork."
    },
    {
      id: 'q021', chapter: 'ch12', subSkill: 'ss08', bloomLevel: 'apply', weightage: 8, year: 2022,
      text: 'An action potential is triggered when the membrane potential reaches:',
      options: ['Resting potential (–70 mV)', 'Threshold potential (~–55 mV)', '+30 mV', '0 mV'],
      correct: 1,
      explanation: 'Once the membrane is depolarized to the threshold potential (~–55 mV), voltage-gated Na⁺ channels open rapidly and an action potential is generated.'
    },
    {
      id: 'q022', chapter: 'ch13', subSkill: 'ss09', bloomLevel: 'remember', weightage: 7, year: 2021,
      text: 'Which gland secretes melatonin, and what is its primary function?',
      options: [
        'Adrenal cortex — regulates stress',
        'Pineal gland — regulates circadian rhythms',
        'Thyroid gland — regulates metabolism',
        'Pituitary gland — regulates growth'
      ],
      correct: 1,
      explanation: 'The pineal gland secretes melatonin in response to darkness, which regulates circadian rhythms and seasonal reproductive cycles.'
    },
    {
      id: 'q023', chapter: 'ch09', subSkill: 'ss14', bloomLevel: 'understand', weightage: 7, year: 2023,
      text: 'Which of the following correctly describes the ABO blood group system?',
      options: [
        'Blood group A has B antigens on RBCs and anti-A antibodies in plasma',
        'Blood group O has no antigens on RBCs and both anti-A and anti-B antibodies in plasma',
        'Blood group AB has no antibodies on RBCs',
        'Blood group B has A antigens and anti-B antibodies'
      ],
      correct: 1,
      explanation: 'Blood group O: no A or B antigens on RBCs, but both anti-A and anti-B antibodies in plasma — making O donors universal but O recipients restricted.'
    },
    {
      id: 'q024', chapter: 'ch05', subSkill: 'ss07', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'The final electron acceptor in aerobic cellular respiration in the electron transport chain is:',
      options: ['NAD⁺', 'FAD', 'Oxygen (O₂)', 'Carbon dioxide (CO₂)'],
      correct: 2,
      explanation: 'O₂ is the terminal electron acceptor in aerobic respiration, accepting electrons at Complex IV (cytochrome c oxidase) to form water.'
    },
    {
      id: 'q025', chapter: 'ch01', subSkill: 'ss01', bloomLevel: 'analyze', weightage: 8, year: 2024,
      text: 'Which cell component is absent in plant cells but present in animal cells?',
      options: ['Cell wall', 'Mitochondria', 'Centrioles', 'Chloroplasts'],
      correct: 2,
      explanation: 'Centrioles are present in animal cells (and lower plant cells) but absent in most higher plant cells. They are involved in forming the spindle apparatus during cell division.'
    },
    {
      id: 'q026', chapter: 'ch15', subSkill: 'ss20', bloomLevel: 'understand', weightage: 7, year: 2022,
      text: 'The pollen tube grows through which part of the pistil to deliver the male gametes?',
      options: ['Stigma', 'Style', 'Ovary wall', 'Funicle'],
      correct: 1,
      explanation: 'After landing on the stigma, pollen germinates and the pollen tube grows through the style (transmitting tissue) to reach the ovule.'
    },
    {
      id: 'q027', chapter: 'ch20', subSkill: 'ss21', bloomLevel: 'understand', weightage: 5, year: 2021,
      text: 'According to the Hardy-Weinberg principle, allele frequencies in a population remain constant if:',
      options: [
        'Natural selection is acting strongly on the population',
        'Random mating, no mutation, no migration, no genetic drift, no selection',
        'Population size is very small',
        'Gene flow occurs between populations'
      ],
      correct: 1,
      explanation: 'Hardy-Weinberg equilibrium requires: random mating, large population (no genetic drift), no mutations, no gene flow, and no natural selection.'
    },
    {
      id: 'q028', chapter: 'ch06', subSkill: 'ss22', bloomLevel: 'understand', weightage: 5, year: 2022,
      text: 'Which plant hormone is primarily responsible for apical dominance?',
      options: ['Gibberellin', 'Cytokinin', 'Auxin (IAA)', 'Abscisic acid'],
      correct: 2,
      explanation: 'Auxin produced at the apical bud suppresses lateral bud growth (apical dominance). Removal of the apical bud allows lateral buds to grow.'
    },
    {
      id: 'q029', chapter: 'ch22', subSkill: 'ss23', bloomLevel: 'remember', weightage: 5, year: 2023,
      text: 'Which of the following is a product of plant breeding developed through induced mutagenesis?',
      options: ['Bt cotton', 'Sharbati Sonora wheat', 'Golden Rice', 'Flavr Savr tomato'],
      correct: 1,
      explanation: 'Sharbati Sonora is a variety of wheat developed through radiation-induced mutagenesis. Bt cotton and Golden Rice involve genetic engineering.'
    },
    {
      id: 'q030', chapter: 'ch08', subSkill: 'ss24', bloomLevel: 'remember', weightage: 6, year: 2022,
      text: 'Normal tidal volume in an adult human at rest is approximately:',
      options: ['1200 mL', '2300 mL', '500 mL', '3500 mL'],
      correct: 2,
      explanation: 'Tidal volume (TV) is the volume of air inhaled or exhaled in a normal breath at rest, approximately 500 mL.'
    },
  ],

  /* ---- Foundation Assessment Questions (subset) ---- */
  foundationQuestions: ['q001','q002','q003','q004','q005','q006','q007','q008','q009','q010',
                         'q011','q012','q013','q014','q015','q016','q017','q018','q019','q020'],

  /* ---- Error Types ---- */
  errorTypes: [
    { id: 'conceptual_gap', label: 'Conceptual Gap', description: 'Did not know the concept' },
    { id: 'silly_mistake',  label: 'Silly Mistake',  description: 'Knew it but made a careless error' },
    { id: 'misread',        label: 'Misread',         description: 'Misread the question or options' },
    { id: 'time',           label: 'Time Pressure',   description: 'Ran out of time to think properly' },
    { id: 'guessed',        label: 'Guessed',         description: 'Had no idea, guessed randomly' },
  ],

  /* ---- Mock Weakness Map (Chapter-wise) ---- */
  weaknessMap: [
    {
      chapterId: 'ch04', chapterName: 'Photosynthesis', icon: '🌿', classLevel: '11',
      severity: 0.85, weightage: 8, priority: 0, performance: 25, daysToExam: 120, questionsWrong: 6
    },
    {
      chapterId: 'ch19', chapterName: 'Molecular Basis of Inheritance', icon: '🔗', classLevel: '12',
      severity: 0.80, weightage: 9, priority: 0, performance: 30, daysToExam: 120, questionsWrong: 5
    },
    {
      chapterId: 'ch18', chapterName: 'Principles of Inheritance', icon: '🧩', classLevel: '12',
      severity: 0.75, weightage: 9, priority: 0, performance: 38, daysToExam: 120, questionsWrong: 5
    },
    {
      chapterId: 'ch12', chapterName: 'Neural Control & Coordination', icon: '🧠', classLevel: '11',
      severity: 0.70, weightage: 8, priority: 0, performance: 40, daysToExam: 120, questionsWrong: 4
    },
    {
      chapterId: 'ch13', chapterName: 'Chemical Coordination', icon: '⚗️', classLevel: '11',
      severity: 0.65, weightage: 7, priority: 0, performance: 45, daysToExam: 120, questionsWrong: 4
    },
    {
      chapterId: 'ch05', chapterName: 'Respiration in Plants', icon: '💨', classLevel: '11',
      severity: 0.60, weightage: 6, priority: 0, performance: 50, daysToExam: 120, questionsWrong: 3
    },
  ],

  /* ---- Spaced Retest Schedule ---- */
  spacedRetestSchedule: [
    {
      subSkillId: 'ss05', subSkillName: 'Light reaction steps (Z-scheme)',
      chapterName: 'Photosynthesis',
      checkpoints: [
        { day: 1,  status: 'completed', date: null, score: 70 },
        { day: 4,  status: 'due',       date: null, score: null },
        { day: 10, status: 'upcoming',  date: null, score: null },
      ]
    },
    {
      subSkillId: 'ss10', subSkillName: 'Mendelian genetics problems',
      chapterName: 'Principles of Inheritance',
      checkpoints: [
        { day: 1,  status: 'completed', date: null, score: 60 },
        { day: 4,  status: 'completed', date: null, score: 80 },
        { day: 10, status: 'due',       date: null, score: null },
      ]
    },
  ],

  /* ---- Mock Performance & Ranking --- */
  performance: {
    studentName: '',
    overallAccuracy: 68,
    testsAttempted: 12,
    questionsAttempted: 340,
    correctAnswers: 231,
    incorrectAnswers: 78,
    unattempted: 31,
    currentStreak: 5,
    longestStreak: 9,
    rank: 142,
    totalStudents: 8540,
    percentile: 98.3,
    weeklyProgress: [52, 58, 63, 61, 68, 72, 68],
    badges: [
      { id: 'b01', name: '7-Day Streak',   icon: '🔥', earned: true  },
      { id: 'b02', name: 'First Test',     icon: '⭐', earned: true  },
      { id: 'b03', name: 'Perfect Score',  icon: '💯', earned: false },
      { id: 'b04', name: 'Top 1%',         icon: '🏆', earned: false },
      { id: 'b05', name: 'Speed Demon',    icon: '⚡', earned: false },
      { id: 'b06', name: 'Consistent',     icon: '📈', earned: true  },
    ],
    chapterProgress: {
      'ch19': 72, 'ch18': 65, 'ch04': 48, 'ch12': 55, 'ch13': 61,
      'ch09': 70, 'ch10': 58, 'ch02': 75, 'ch03': 63, 'ch05': 52,
    },
    /* ---- Demo seed for the Chapter-wise Test performance graph on the
       Rank/Performance page. Only used as a fallback when the student
       hasn't recorded any real chapter-test attempts yet (see
       getChapterTestTrend()), same "not empty on first visit" idea as
       spacedReviewSeed above. ---- */
    chapterTestHistorySeed: [
      { label: 'Test 1', chapterName: 'Cell: The Unit of Life',        score: 21, total: 35, accuracy: 60 },
      { label: 'Test 2', chapterName: 'Photosynthesis',                score: 26, total: 40, accuracy: 65 },
      { label: 'Test 3', chapterName: 'Respiration in Plants',         score: 20, total: 30, accuracy: 67 },
      { label: 'Test 4', chapterName: 'Neural Control & Coordination', score: 24, total: 40, accuracy: 60 },
      { label: 'Test 5', chapterName: 'Principles of Inheritance',     score: 30, total: 44, accuracy: 68 },
      { label: 'Test 6', chapterName: 'Molecular Basis of Inheritance',score: 33, total: 46, accuracy: 72 },
      { label: 'Test 7', chapterName: 'Human Health & Disease',        score: 27, total: 38, accuracy: 71 },
      { label: 'Test 8', chapterName: 'Ecosystem',                     score: 24, total: 32, accuracy: 75 },
    ],
    /* ---- Demo seed for the Full-Length Test performance graph. Same
       fallback role as chapterTestHistorySeed, used when
       state.fullLengthTests has no recorded attempts yet. ---- */
    fullLengthHistorySeed: [
      { label: 'FLT 1', title: 'Full Length Test 1', score: 52, total: 90, accuracy: 58 },
      { label: 'FLT 2', title: 'Full Length Test 2', score: 58, total: 90, accuracy: 64 },
      { label: 'FLT 3', title: 'Full Length Test 3', score: 61, total: 90, accuracy: 68 },
      { label: 'FLT 4', title: 'Full Length Test 4', score: 65, total: 90, accuracy: 72 },
    ],
  },

  /* ---- Spaced Review Pool (question-level, Day 1 → 4 → 10) ----
     Seed data so the Improvement Book demo isn't empty on first visit.
     Real entries get added automatically when the student gets a
     question wrong in a Chapter Test or Create Your Own Test — see
     `processTestResultForSpacedReview()` in dashboard.js. */
  spacedReviewSeed: [
    { questionId: 'q001', chapter: 'ch19', reviewStage: 'day1',  successfulRetests: 0 },
    { questionId: 'q009', chapter: 'ch19', reviewStage: 'day1',  successfulRetests: 0 },
    { questionId: 'q020', chapter: 'ch19', reviewStage: 'day1',  successfulRetests: 1 },
    { questionId: 'q002', chapter: 'ch04', reviewStage: 'day1',  successfulRetests: 0 },
    { questionId: 'q012', chapter: 'ch04', reviewStage: 'day4',  successfulRetests: 1 },
    { questionId: 'q003', chapter: 'ch18', reviewStage: 'day4',  successfulRetests: 0 },
    { questionId: 'q013', chapter: 'ch18', reviewStage: 'day4',  successfulRetests: 1 },
    { questionId: 'q004', chapter: 'ch12', reviewStage: 'day4',  successfulRetests: 0 },
    { questionId: 'q021', chapter: 'ch12', reviewStage: 'day10', successfulRetests: 1 },
    { questionId: 'q010', chapter: 'ch13', reviewStage: 'day10', successfulRetests: 1 },
    { questionId: 'q022', chapter: 'ch13', reviewStage: 'day10', successfulRetests: 0 },
    { questionId: 'q007', chapter: 'ch10', reviewStage: 'day1',  successfulRetests: 0 },
  ],

  /* ---- Homepage Slides ---- */
  homeSlides: [
    {
      id: 's1',
      tag: '⚡ 100% HIGH YIELD',
      emoji: '🧬',
      title: 'Stop cramming. Start dominating.',
      subtitle: 'Break 28 chapters into high-yield sub-skills. Understand mechanisms, predict the questions.',
      cta: 'Explore Chapters',
      screen: 'chapter-test',
      theme: 'emerald'
    },
    {
      id: 's2',
      tag: '🔥 LOCK IN PROTOCOL',
      emoji: '⚡',
      title: 'Consistency is your superpower.',
      subtitle: '10 focused questions a day beats 10 hours of panic. Keep the streak burning.',
      cta: 'Start Daily Practice',
      screen: 'chapter-test',
      theme: 'sunset'
    },
    {
      id: 's3',
      tag: '🎯 ZERO REGRETS',
      emoji: '💡',
      title: 'Turn wrong answers into rank fuel.',
      subtitle: 'Auto-tag conceptual slips & silly mistakes. Re-test on Day 1, 4, 10 until 100% locked in.',
      cta: 'Open Improvement Book',
      screen: 'improvement-book',
      theme: 'violet'
    },
  ],

  /* ---- Badge descriptions ---- */
  badgeDescriptions: {
    'b01': 'Log in 7 days in a row',
    'b02': 'Complete your first test',
    'b03': 'Score 100% on any test',
    'b04': 'Reach the top 1% of all students',
    'b05': 'Finish a test in under half the time limit',
    'b06': 'Maintain a streak for 14 days',
  },

  /* ---- Default Student ---- */
  defaultStudent: {
    name: '',
    username: '',
    avatarDataUrl: null,      // local/frontend-only picture preview (base64), no cloud storage
    classLevel: '12th',       // '11th', '12th', 'Dropper'
    targetYear: '2025',
    studyHoursPerDay: '4',
    board: 'CBSE',
    strongAreas: [],
    weakAreas: [],
    passwordUpdatedAt: null,  // mock flag only — never store real passwords client-side
  },

};

/* ---- Weakness Priority Calculation ----
   Formula: severity × NEET weightage × (1 / days-to-exam factor)
   Note: Exact numerical definitions not finalized. Using demo values.
   Replace with backend calculation when ready.
*/
function calculateWeaknessPriority(severity, weightage, daysToExam) {
  const urgencyFactor = daysToExam <= 0 ? 1 : (1 / Math.log(daysToExam + 1));
  return Math.round(severity * weightage * urgencyFactor * 100);
}

/* ---- Compute & sort weakness map priorities ---- */
DB.weaknessMap.forEach(w => {
  w.priority = calculateWeaknessPriority(w.severity, w.weightage, w.daysToExam);
});
DB.weaknessMap.sort((a, b) => b.priority - a.priority);

/* ---- Helper: get question objects by IDs ---- */
function getQuestionsByIds(ids) {
  return ids.map(id => DB.questions.find(q => q.id === id)).filter(Boolean);
}

/* ---- Helper: get chapter questions ---- */
function getQuestionsByChapter(chapterId, limit = 10) {
  const qs = DB.questions.filter(q => q.chapter === chapterId);
  if (qs.length === 0) {
    // fallback: return first N general questions
    return DB.questions.slice(0, limit);
  }
  return qs.slice(0, limit);
}

/* ---- Helper: get sub-skill questions ---- */
function getQuestionsBySubSkill(subSkillId, limit = 5) {
  const qs = DB.questions.filter(q => q.subSkill === subSkillId);
  if (qs.length === 0) return DB.questions.slice(0, limit);
  return qs.slice(0, limit);
}

/* ---- Helper: build the question set for a Full Length Test.
   The demo Biology question bank is smaller than a real 90-question
   NEET paper, so the pool is shuffled and cycled to fill numberOfQuestions.
   This keeps every attempt frontend-only with no backend/API involved. ---- */
function getFullLengthTestQuestions(test) {
  const pool = DB.questions;
  if (pool.length === 0) return [];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const qs = [];
  for (let i = 0; i < test.numberOfQuestions; i++) {
    qs.push(shuffled[i % shuffled.length]);
  }
  return qs;
}

/* ---- Helper: read a Full Length Test's saved progress (attempts,
   best score, attempt history) from state. ---- */
function getFLTProgress(testId) {
  const state = State.get();
  return (state.fullLengthTests && state.fullLengthTests[testId]) || {
    attempts: 0,
    bestScore: 0,
    bestTotal: 0,
    attemptHistory: [],
  };
}

/* ---- Helper: record a completed Full Length Test attempt into state.
   Best score is only ever raised, never lowered by a later attempt. ---- */
function recordFLTAttempt(testId, results) {
  const state = State.get();
  if (!state.fullLengthTests) state.fullLengthTests = {};
  const prog = state.fullLengthTests[testId] || { attempts: 0, bestScore: 0, bestTotal: 0, attemptHistory: [] };

  prog.attempts += 1;
  prog.attemptHistory.push({ attempt: prog.attempts, score: results.correct, total: results.totalQuestions, accuracy: results.accuracy });
  // Update best score on the first-ever attempt (so bestTotal isn't left at
  // 0) and on any later attempt that beats the current best. Best score
  // never decreases.
  if (prog.attempts === 1 || results.correct > prog.bestScore) {
    prog.bestScore = results.correct;
    prog.bestTotal = results.totalQuestions;
  }

  state.fullLengthTests[testId] = prog;
  State.save(state);
  return prog;
}

/* ---- Helper: record a completed Chapter Test / Custom Test attempt
   into the chapter-wise performance trend history (used by the
   Rank/Performance page graph). Mirrors recordFLTAttempt's role for
   Full Length Tests. ---- */
function recordChapterTestAttempt(results) {
  if (results.mode !== 'chapter' && results.mode !== 'custom') return;
  const state = State.get();
  if (!state.performance.chapterTestHistory) state.performance.chapterTestHistory = [];
  const hist = state.performance.chapterTestHistory;
  const chapterName = (results.meta && (results.meta.chapterName || results.meta.title)) || 'Custom Test';

  hist.push({
    label: `Test ${hist.length + 1}`,
    chapterName,
    score: results.correct,
    total: results.totalQuestions,
    accuracy: results.accuracy,
  });
  // Cap history length so the chart/graph stays readable and state doesn't grow unbounded
  if (hist.length > 30) hist.shift();

  state.performance.chapterTestHistory = hist;
  State.save(state);
  return hist;
}

/* ---- Helper: chronological Chapter-wise Test performance trend for
   the Performance page graph. Uses real recorded attempts once the
   student has taken chapter tests; falls back to demo seed data so the
   graph isn't empty on first visit. ---- */
function getChapterTestTrend(limit = 12) {
  const state = State.get();
  const real = (state.performance && state.performance.chapterTestHistory) || [];
  const source = real.length > 0 ? real : DB.performance.chapterTestHistorySeed;
  return source.slice(-limit);
}

/* ---- Helper: chronological Full-Length Test performance trend for
   the Performance page graph. Flattens each Full Length Test's latest
   attempt (recorded via recordFLTAttempt) in test order; falls back to
   demo seed data when nothing has been attempted yet. ---- */
function getFullLengthTestTrend() {
  const state = State.get();
  const real = [];
  DB.fullLengthTests.forEach((t, i) => {
    const prog = (state.fullLengthTests && state.fullLengthTests[t.id]) || null;
    if (prog && prog.attemptHistory && prog.attemptHistory.length > 0) {
      const latest = prog.attemptHistory[prog.attemptHistory.length - 1];
      real.push({
        label: `FLT ${i + 1}`,
        title: t.title,
        score: latest.score,
        total: latest.total,
        accuracy: latest.accuracy,
      });
    }
  });
  return real.length > 0 ? real : DB.performance.fullLengthHistorySeed;
}

/* ---- LocalStorage State ---- */
const State = {
  KEY: 'bioready_v1',

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const state = raw ? JSON.parse(raw) : this.defaultState();
      // Migration: older saved sessions won't have these fields yet.
      if (!state.spacedReviewPool) {
        state.spacedReviewPool = DB.spacedReviewSeed.map(s => ({ ...s, status: 'active', wrongDate: Date.now() }));
      }
      if (!state.masteredPool) state.masteredPool = [];
      if (!state.fullLengthTests) state.fullLengthTests = {};
      if (state.performance && !state.performance.chapterTestHistory) state.performance.chapterTestHistory = [];
      return state;
    } catch {
      return this.defaultState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch {
      console.warn('Could not save to localStorage');
    }
  },

  update(patch) {
    const state = this.get();
    const next = Object.assign({}, state, patch);
    this.save(next);
    return next;
  },

  defaultState() {
    return {
      configured: false,
      foundationDone: false,
      student: { ...DB.defaultStudent },
      performance: { ...DB.performance },
      weaknessMap: JSON.parse(JSON.stringify(DB.weaknessMap)),
      spacedRetests: JSON.parse(JSON.stringify(DB.spacedRetestSchedule)),
      spacedReviewPool: DB.spacedReviewSeed.map(s => ({
        ...s,
        status: 'active',
        wrongDate: Date.now(),
      })),
      masteredPool: [],
      fullLengthTests: {},
      lastTestResult: null,
      lastWeaknessAnalysis: null,
      currentScreen: 'config',
    };
  },

  reset() {
    localStorage.removeItem(this.KEY);
    return this.defaultState();
  }
};
