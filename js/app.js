/* =====================================================================
   APP.JS — 财小伴 大学生理财陪伴AI智能体
   Modular architecture: each function is independently defined.
   Modify any single function without affecting others.
   ===================================================================== */

// =====================================================================
// CONFIGURATION CONSTANTS
// Edit all fixed text, categories, defaults, and rules here.
// =====================================================================

/** LocalStorage key */
var STORAGE_KEY = 'cmbrace_finance_data';

/** Tutorial steps: color + text */
var TUTORIAL_STEPS = [
  { color: '#FFB800', text: '欢迎使用财小伴' },
  { color: '#4CD964', text: '智能记账' },
  { color: '#5B9DFF', text: '理财知识科普' },
  { color: '#FF6B6B', text: '收支统计分析' },
  { color: '#A864FF', text: '都有AI搭子来帮你' },
  { color: '#FF9500', text: '开始你的理财之旅' }
];

/** Default data structure when no saved data exists */
var DEFAULT_DATA = {
  bills: [],
  monthlyBudget: 2500,
  savingsGoals: [],
  settings: {
    nickname: '同学',
    aiPersona: 'cool-guy',
    investmentAmount: 0
  }
};

/** Expense categories (college student specific) */
var EXPENSE_CATEGORIES = [
  { key: 'food',         name: '餐饮',   icon: '🍔' },
  { key: 'transport',    name: '交通',   icon: '🚌' },
  { key: 'shopping',     name: '购物',   icon: '🛒' },
  { key: 'entertainment',name: '娱乐',   icon: '🎮' },
  { key: 'study',        name: '学习',   icon: '📚' },
  { key: 'daily',        name: '日用',   icon: '🏠' },
  { key: 'medical',      name: '医疗',   icon: '💊' },
  { key: 'social',       name: '社交',   icon: '❤️' },
  { key: 'digital',      name: '数码',   icon: '📱' },
  { key: 'other',        name: '其他',   icon: '📌' }
];

/** Income categories (college student specific) */
var INCOME_CATEGORIES = [
  { key: 'allowance',    name: '生活费', icon: '💰' },
  { key: 'parttime',     name: '兼职',   icon: '💼' },
  { key: 'gift',         name: '红包',   icon: '🎁' },
  { key: 'scholarship',  name: '奖学金', icon: '🏆' },
  { key: 'refund',       name: '退款',   icon: '💵' },
  { key: 'other',        name: '其他',   icon: '📌' }
];

/**
 * Keyword mapping for AI bill category recognition.
 * Each category key maps to an array of Chinese keywords.
 * Edit these to improve AI recognition accuracy.
 */
var CATEGORY_KEYWORDS = {
  food:          ['吃饭','外卖','食堂','饭','餐','奶茶','咖啡','饮料','零食','水果','烧烤','火锅','面包','早餐','午餐','晚餐','夜宵','小吃','甜品','鸡','鱼','虾','牛','猪','面','米','粉','串','锅','麻辣烫','黄焖鸡','炸鸡'],
  transport:     ['公交','地铁','打车','出租车','滴滴','出行','交通','高铁','火车','机票','单车','骑行','加油','停车','共享','骑车'],
  shopping:      ['购物','买衣服','买鞋','买包','淘宝','京东','拼多多','快递','代购','化妆品','护肤品','衣服','鞋子','裤子','裙子','帽子','首饰','帆布包','T恤','袜子'],
  entertainment: ['电影','游戏','KTV','唱歌','旅游','出去玩','娱乐','门票','聚会','轰趴','密室','剧本杀','游乐','唱','视频会员'],
  study:         ['书','本','笔','文具','打印','考试','培训','课程','报名费','资料','学','考证','教材','网课'],
  daily:         ['日用','牙膏','牙刷','洗发水','沐浴露','纸巾','话费','宽带','水电','房租','物业','日用品','洗衣','洗澡','宿舍','校园卡','洗衣液'],
  medical:       ['药','医院','挂号','看病','检查','体检','打针','牙医','诊所','口罩','感冒药'],
  social:        ['聚餐','AA','给朋友','请客','送礼','生日','份子','社团','班级聚会'],
  digital:       ['手机','电脑','平板','耳机','充电','数据线','U盘','硬盘','软件','会员','App','手机壳','充电宝'],
  allowance:     ['生活费','妈妈给','爸爸给','家里给','家长给','转账'],
  parttime:      ['兼职','打工','实习','暑假工','发传单','家教','代课','图书馆助理','项目'],
  gift:          ['红包','收到','过年','压岁钱','生日红包','节日红包','微信红包','抢红包','奶奶给'],
  scholarship:   ['奖学金','补助','助学金','勤工','奖金','比赛奖'],
  refund:        ['退款','退货','返现','报销','退']
};

/** AI persona response templates for the + button AI chat */
var AI_PERSONA_RESPONSES = {
  warm:         '我是你的记账小帮手~ 你可以直接告诉我花了多少钱或赚了多少钱，比如"吃饭花了18元""兼职赚了300元"，我帮你自动记账！也可以点下方「📝 手动记账」精确录入哦 😊',
  professional: '您好，请描述您的收支情况以便记账。格式参考："餐饮消费25元"或"兼职收入300元"。也可使用下方的「手动记账」功能。',
  humorous:     '嘿！直接跟我说你花了啥赚了啥就行啦~ 比如"干饭花了20块""搬砖赚了200块"，我秒秒钟帮你记好！也可以用下面的手动记账面板自己填哦 🤪'
};

/**
 * Finance AI knowledge base.
 * Keys are pipe-separated trigger keywords. First match wins.
 * 'default' is the fallback response.
 */
var FINANCE_AI_RESPONSES = {
  '理财|开始|入门': '大学生理财入门，建议从这三步开始：\n\n1️⃣ 坚持记账，了解自己的消费习惯\n2️⃣ 设定攒钱目标，先储蓄后消费\n3️⃣ 学习基础理财知识，从货币基金等低风险产品开始\n\n记住：理财不是一夜暴富，而是长期积累的好习惯！💰',
  '基金':          '基金是把钱交给专业基金经理帮你投资。对大学生来说，可以先了解货币基金（如余额宝）和指数基金。\n\n⚠️ 提醒：基金有风险，投资需谨慎。建议先用模拟盘学习，不要拿生活费去冒险哦！',
  '股票':          '股票代表你持有公司的一部分所有权。股票投资风险较高，不建议大学生用生活费炒股。\n\n如果你想了解，建议先从模拟交易开始学习，或者通过指数基金间接参与。\n\n💡 现阶段更重要的是提升自己的"人力资本"——学好专业、培养技能！',
  '攒钱|储蓄|省钱': '大学生攒钱小技巧：\n\n📝 坚持记账，找出"拿铁因子"（那些不起眼但累积起来很多的小额消费）\n🎯 设定具体目标（比如"3个月攒2000元去旅行"）\n💰 拿到生活费先存20%\n🍱 减少外卖，食堂更实惠\n📚 利用学校图书馆等免费资源\n🚌 多坐公共交通，少打车',
  '预算|规划':      '建议使用50/30/20预算法则：\n\n🔵 50% - 必要支出：吃饭、交通、学习用品\n🟡 30% - 非必要但想要：娱乐、购物、社交\n🟢 20% - 储蓄：攒钱目标、应急基金\n\n当然这只是参考，可以根据你的实际情况调整比例。关键是养成规划的意识和习惯！',
  '风险|亏损':      '投资风险是指你的投资可能亏损的可能性。\n\n📊 风险等级从低到高：\n🟢 低风险：银行存款、货币基金\n🟡 中风险：债券基金、理财产品\n🔴 高风险：股票、期货、虚拟货币\n\n💡 大学生阶段建议以低风险为主，先保证本金安全，再考虑增值。',
  '信用卡|花呗|借呗':'关于信用消费（花呗/信用卡）：\n\n✅ 合理使用的好处：建立信用记录、应急周转\n❌ 滥用的风险：过度消费、高额利息、影响征信\n\n💡 建议：\n• 每月消费不超过生活费的30%\n• 按时还款，绝不逾期\n• 不要"以贷养贷"\n• 如果控制不住，干脆关掉',
  '兼职|赚钱|收入':  '大学生常见增收方式：\n\n💼 校内：图书馆助理、实验室助理、家教\n💻 线上：文案写作、设计接单、视频剪辑\n📚 学业：奖学金是最"划算"的收入！\n\n⚠️ 注意：\n• 不要影响学业\n• 谨防"先交钱"的兼职骗局\n• 合理安排时间，身体最重要',
  'default':        '这是个好问题！作为大学生，理财最重要的是先建立正确的金钱观和消费观。\n\n建议从记账开始，了解自己的收支情况，再逐步学习基础理财知识。\n\n💡 你可以问我：\n• "怎么开始理财？"\n• "基金是什么？"\n• "怎么攒钱？"\n• "大学生适合投资什么？"'
};

/**
 * Finance knowledge content (for finance cards).
 * { title, content }
 */
var FINANCE_KNOWLEDGE = {
  knowledge: {
    title: '📖 大学生理财入门科普',
    content:
      '<b>1. 什么是理财？</b><br>理财不是"有钱人"的专利，而是每个人管理自己财富的能力。对大学生来说，理财=合理规划收支+培养储蓄习惯+了解基础金融知识。<br><br>' +
      '<b>2. 为什么大学生需要理财？</b><br>• 培养独立管理财务的能力<br>• 建立应急储蓄的安全感<br>• 为毕业后租房、工作过渡做准备<br>• 早点开始，复利效应更明显<br><br>' +
      '<b>3. 理财第一步：记账</b><br>了解自己的钱花在哪里是理财的基础。建议坚持记账1-3个月，摸清自己的消费模式。<br><br>' +
      '<b>4. 储蓄法则</b><br>• 50/30/20法则：50%必要开支+30%非必要+20%储蓄<br>• 先储蓄后消费：拿到钱先存一部分<br>• 设定攒钱目标：旅行基金、考证基金等<br><br>' +
      '<b>5. 大学生适合的理财方式</b><br>• 货币基金（余额宝等）：低风险、流动性好<br>• 定期存款：安全稳妥<br>• 国债逆回购：节假日收益较高<br>• 指数基金定投（需学习后谨慎尝试）<br><br>' +
      '⚠️ <b>重要提醒</b>：不盲目跟风投资、不借钱投资、不了解的产品不碰！'
  },
  allocation: {
    title: '📘 低风险理财概念讲解',
    content:
      '<b>适合大学生的低风险理财方式</b><br><br>' +
      '<b>1. 货币基金（如余额宝、零钱通）</b><br>• 风险极低，随存随取<br>• 年化收益约1.5%-2.5%<br>• 适合存放日常备用金<br><br>' +
      '<b>2. 银行定期存款</b><br>• 50万以内有存款保险保障<br>• 期限3个月到5年可选<br>• 利率固定，到期自动转存<br><br>' +
      '<b>3. 国债 / 国债逆回购</b><br>• 国家信用背书，几乎零风险<br>• 逆回购在节假日前收益较高<br>• 起投金额低，适合学生体验<br><br>' +
      '<b>4. 同业存单指数基金</b><br>• 风险略高于货基，收益也略高<br>• 适合3-6个月不用的闲钱<br><br>' +
      '<b>5. 定投指数基金（学习阶段）</b><br>• 需要用闲钱，做好3-5年持有准备<br>• 建议先模拟学习，再小金额尝试<br>• 不追涨杀跌，坚持长期定投<br><br>' +
      '⚠️ <b>大学生理财三原则</b>：<br>• 不借钱投资<br>• 不了解的产品不碰<br>• 先学习再实践，稳字当头'
  },
  antifraud: {
    title: '🛡️ 校园理财防骗反诈指南',
    content:
      '<b>🚨 常见校园理财骗局</b><br><br>' +
      '<b>1. "高收益"理财诈骗</b><br>承诺"日收益1%""稳赚不赔"的，100%是骗局！正规理财不会承诺固定高收益。<br><br>' +
      '<b>2. 校园贷/培训贷</b><br>以"分期付款""免费培训"为名诱导贷款，利率极高且暴力催收。坚决不碰！<br><br>' +
      '<b>3. 虚拟货币/挖矿骗局</b><br>拉人头返佣、空气币、资金盘，本质是庞氏骗局。<br><br>' +
      '<b>4. "大师带单"杀猪盘</b><br>社交平台上冒充"理财大师""投资高手"，先给甜头后卷款跑路。<br><br>' +
      '<b>5. 刷单返利诈骗</b><br>"做任务赚佣金"先给小额返利，诱骗大额投入后无法提现。<br><br>' +
      '<b>🛡️ 防骗三原则</b><br>• <b>不轻信</b>：不轻信陌生人推荐的投资理财产品<br>• <b>不转账</b>：不向不明账户转账汇款<br>• <b>不透露</b>：不透露银行卡号、验证码、身份证号<br><br>' +
      '<b>📞 遇到可疑情况</b><br>• 拨打反诈专线：96110<br>• 下载国家反诈中心APP<br>• 向学校保卫处或辅导员求助'
  }
};

/** Risk quiz questions */
var RISK_QUIZ_QUESTIONS = [
  {
    q: '当你有一笔闲钱时，你更倾向于？',
    opts: ['存入银行，安全第一', '一部分存银行，一部分尝试低风险理财', '愿意尝试中等风险投资获取更高收益', '追求高收益，愿意承担高风险']
  },
  {
    q: '如果你的投资亏损了20%，你会？',
    opts: ['立即全部卖出，不再投资', '卖出部分，观察情况', '继续持有，相信会涨回来', '加仓买入，摊低成本']
  },
  {
    q: '你对理财知识的了解程度？',
    opts: ['完全不了解', '知道一些基础概念', '有一定了解，看过相关书籍', '比较熟悉，有实践经验']
  }
];

/**
 * Chart color palette (for statistics page).
 * Edit to change chart appearance.
 */
var CHART_COLORS = [
  '#FF6B6B', '#FFB800', '#5B9DFF', '#4CD964', '#FF9500',
  '#AF52DE', '#FF2D55', '#5856D6', '#34C759', '#8E8E93'
];

/** Test data scenario definitions (for loadTestData) */
var TEST_SCENARIOS = [
  { cat: 'food',         names: ['食堂午餐','食堂晚餐','外卖炸鸡','奶茶','早餐包子','食堂早餐','麻辣烫','黄焖鸡','水果店','面包店'], min: 6,  max: 35,  weight: 35, type: 'expense' },
  { cat: 'transport',    names: ['地铁通勤','公交','打车','共享单车月卡','高铁回家'],                              min: 2,  max: 80,  weight: 8,  type: 'expense' },
  { cat: 'shopping',     names: ['淘宝买T恤','京东买书','拼多多日用品','买洗发水','买护肤品','买袜子','买帆布包'],    min: 15, max: 150, weight: 8,  type: 'expense' },
  { cat: 'entertainment',names: ['电影票','游戏充值','KTV唱歌','游乐园门票','剧本杀','视频会员'],                  min: 15, max: 120, weight: 5,  type: 'expense' },
  { cat: 'study',        names: ['买教材','打印资料','考试报名费','网课会员','文具','考证资料'],                    min: 5,  max: 200, weight: 6,  type: 'expense' },
  { cat: 'daily',        names: ['话费充值','买纸巾','洗衣液','牙膏牙刷','宿舍用品','校园卡充值'],                  min: 10, max: 60,  weight: 5,  type: 'expense' },
  { cat: 'social',       names: ['室友聚餐','朋友生日礼物','班级聚会','社团活动','请客吃饭'],                      min: 30, max: 180, weight: 4,  type: 'expense' },
  { cat: 'digital',      names: ['手机壳','数据线','耳机','App会员','U盘','充电宝'],                              min: 9,  max: 99,  weight: 3,  type: 'expense' },
  { cat: 'medical',      names: ['感冒药','看牙医','体检','买口罩'],                                              min: 15, max: 120, weight: 1,  type: 'expense' },
  { cat: 'allowance',    names: ['妈妈转生活费','爸爸给零花钱','家里给的生活费'],                                   min: 1000, max: 2000, weight: 2, type: 'income' },
  { cat: 'parttime',     names: ['周末家教','线上兼职','发传单兼职','图书馆助理','帮老师做项目'],                    min: 80, max: 500, weight: 4,  type: 'income' },
  { cat: 'gift',         names: ['奶奶给的红包','生日红包','过年红包','抢到的微信红包'],                            min: 20, max: 300, weight: 2,  type: 'income' },
  { cat: 'refund',       names: ['淘宝退款','外卖退款','买书退货退款'],                                           min: 10, max: 80,  weight: 1,  type: 'income' }
];

// =====================================================================
// APP STATE
// =====================================================================

var state = {
  data: null,
  currentMonth: { year: 0, month: 0 },
  aiChatOpen: false,
  manualPanelOpen: false,
  billType: 'expense',
  selectedCategory: 'food',
  manualAmount: '0',
  trendChart: null,
  categoryChart: null,
  tutorialStep: 0,
  splashDone: false,
  pieMode: 'month',
  insightMode: 'month',
  trendYearStart: 2026,
  trendYearEnd: 2026,
  quizScore: null,
  quizRetaken: false,
  conversationHistory: [],
  lastMessageTime: 0,
  convTimer: null
};

// =====================================================================
// STORAGE FUNCTIONS (load / save / export / import / clear)
// =====================================================================

/** Load data from localStorage. Returns DEFAULT_DATA if nothing saved. */
function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var d = JSON.parse(raw);
      return {
        bills:          d.bills          || [],
        monthlyBudget:  d.monthlyBudget  || DEFAULT_DATA.monthlyBudget,
        savingsGoals:   d.savingsGoals   || [],
        settings:       extend({}, DEFAULT_DATA.settings, d.settings || {})
      };
    }
  } catch (e) {
    console.error('Data load error:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

/** Save current state.data to localStorage. */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

/**
 * Export data as downloadable JSON file.
 */
function exportData() {
  var blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href   = url;
  a.download = '财小伴_数据备份_' + todayStr() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据导出成功！');
}

/**
 * Import data from a JSON string.
 * @param {string} jsonStr
 * @returns {boolean} success
 */
function importData(jsonStr) {
  try {
    var d = JSON.parse(jsonStr);
    if (!d.bills || !Array.isArray(d.bills)) {
      throw new Error('Invalid data format');
    }
    state.data = {
      bills:          d.bills          || [],
      monthlyBudget:  d.monthlyBudget  || DEFAULT_DATA.monthlyBudget,
      savingsGoals:   d.savingsGoals   || [],
      settings:       extend({}, DEFAULT_DATA.settings, d.settings || {})
    };
    saveData();
    refreshAll();
    showToast('数据导入成功！');
    return true;
  } catch (e) {
    showToast('数据格式错误，请检查文件');
    return false;
  }
}

/** Clear all localStorage data and reset to defaults. */
function clearAllData() {
  state.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData();
  refreshAll();
  showToast('数据已清空');
}

/**
 * Load built-in test dataset (overwrites current data).
 */
function loadTestData() {
  if (!confirm('加载测试数据将覆盖当前数据，确定继续吗？')) return;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'test-data.json', true);
  xhr.timeout = 10000;

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        if (!data.bills || !Array.isArray(data.bills)) throw new Error('Invalid');
        state.data = {
          bills: data.bills || [],
          monthlyBudget: data.monthlyBudget || 2500,
          savingsGoals: data.savingsGoals || [],
          settings: extend({}, DEFAULT_DATA.settings, data.settings || {})
        };
        saveData();
        refreshAll();
        showToast('测试数据已加载！共 ' + state.data.bills.length + ' 条账单记录');
      } catch (e) {
        showToast('数据文件格式错误');
      }
    } else {
      showToast('加载失败，请检查 test-data.json 是否存在');
    }
  };

  xhr.onerror = function() {
    showToast('加载失败，请将 test-data.json 放在同级目录');
  };

  xhr.send();
}

// =====================================================================
// BILL FUNCTIONS (create / delete / query / parse)
// =====================================================================

/**
 * Save a single bill entry to state.data.bills.
 * @param {Object} billData - { type, amount, category, categoryIcon, categoryName, note, date, time }
 */
function saveBill(billData) {
  var bill = {
    id:           generateId(),
    type:         billData.type,
    amount:       billData.amount,
    category:     billData.category,
    categoryIcon: billData.categoryIcon,
    categoryName: billData.categoryName,
    note:         billData.note || billData.categoryName,
    date:         billData.date || todayStr(),
    time:         billData.time || timeNow()
  };
  state.data.bills.unshift(bill);
  saveData();
  refreshAll();
}

/**
 * Show bill detail modal.
 * @param {string} id
 */
function showBillDetail(id) {
  var bill = state.data.bills.filter(function(b) { return b.id === id; })[0];
  if (!bill) return;

  var typeLabel = bill.type === 'expense' ? '支出' : '收入';
  var color     = bill.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)';
  var sign      = bill.type === 'expense' ? '-' : '+';

  var html = '' +
    '<div style="text-align:center;margin-bottom:12px">' +
      '<div style="font-size:40px;margin-bottom:6px">' + (bill.categoryIcon || '📌') + '</div>' +
      '<div style="font-size:28px;font-weight:700;color:' + color + '">' + sign + '¥' + bill.amount.toFixed(2) + '</div>' +
      '<div style="font-size:13px;color:var(--color-text-secondary);margin-top:4px">' + typeLabel + ' · ' + (bill.categoryName || bill.category) + '</div>' +
    '</div>' +
    '<div style="font-size:13px;line-height:2;color:var(--color-text-secondary)">' +
      '<div>备注：' + (bill.note || '无') + '</div>' +
      '<div>日期：' + (bill.date || '') + ' ' + (bill.time || '') + '</div>' +
    '</div>';

  showModal('账单详情', html, [
    { text: '关闭', cls: 'btn--cancel', action: hideModal },
    { text: '删除', cls: 'btn--danger', action: function() {
      deleteBill(id);
      hideModal();
    }}
  ]);
}

/**
 * Delete a bill by ID.
 * @param {string} id
 */
function deleteBill(id) {
  state.data.bills = state.data.bills.filter(function(b) { return b.id !== id; });
  saveData();
  refreshAll();
  showToast('已删除');
}

/**
 * Get all bills for the currently selected month.
 * @returns {Array}
 */
function getBillsForMonth() {
  var prefix = state.currentMonth.year + '-' + zeroPad(state.currentMonth.month);
  return state.data.bills.filter(function(b) {
    return b.date && b.date.indexOf(prefix) === 0;
  });
}

/**
 * Parse a natural-language text to extract bill info.
 * This is the LOCAL AI simulation function.
 * Replace internals with real API call when backend is ready.
 *
 * @param {string} text - User's natural language input
 * @returns {Object|null} - { type, amount, category, categoryIcon, categoryName, note, date } or null
 */
function parseBillFromText(text) {
  // Expense patterns
  var expensePatterns = [
    /(.{0,10})(?:花了?|消费|用了|付|买|支付)(?:了|掉|费)?(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱)?/,
    /(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱)?\s*(.{0,8})(?:花|消费|买|付)/
  ];
  // Income patterns
  var incomePatterns = [
    /(.{0,10})(?:赚|收|到账|进账|拿到|挣|收入|转)(?:了|到)?(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱)?/,
    /(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱)?\s*(.{0,8})(?:赚|收|到账)/
  ];
  // Fallback: "description + amount + 元/块" at sentence end → check income keywords
  var fallbackPattern = /(.{0,15}?)(\d+(?:\.\d{1,2})?)\s*(?:元|块|块钱)\s*$/;

  var allPatterns = expensePatterns.concat(incomePatterns).concat([fallbackPattern]);

  for (var p = 0; p < allPatterns.length; p++) {
    var match = text.match(allPatterns[p]);
    if (!match) continue;

    var desc, amount;
    if (/^\d/.test(match[1])) {
      amount = parseFloat(match[1]);
      desc   = match[2] || '';
    } else {
      desc   = match[1] || '';
      amount = parseFloat(match[2]);
    }

    if (amount > 0 && amount < 1000000) {
      var isIncome = /(?:赚|收|到账|进账|拿到|挣|收入|生活费|红包|奖学金|退款|转)/.test(text);
      var cat      = classifyCategory(text, isIncome);
      return {
        type:         isIncome ? 'income' : 'expense',
        amount:       amount,
        category:     cat.key,
        categoryIcon: cat.icon,
        categoryName: cat.name,
        note:         desc || cat.name,
        date:         todayStr()
      };
    }
  }

  return null;
}

/**
 * Classify text into a category based on keyword matching.
 * Edit CATEGORY_KEYWORDS to adjust matching rules.
 *
 * @param {string} text
 * @param {boolean} isIncome
 * @returns {Object} - { key, name, icon }
 */
function classifyCategory(text, isIncome) {
  var cats = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  for (var i = 0; i < cats.length; i++) {
    var keywords = CATEGORY_KEYWORDS[cats[i].key] || [];
    for (var k = 0; k < keywords.length; k++) {
      if (text.indexOf(keywords[k]) !== -1) {
        return cats[i];
      }
    }
  }
  return cats[cats.length - 1];
}

// =====================================================================
// BUDGET & SAVINGS FUNCTIONS
// =====================================================================

/** Update monthly budget amount. */
function updateBudget(amount) {
  if (amount > 0) {
    state.data.monthlyBudget = amount;
    saveData();
    renderBookkeeping();
    showToast('预算已更新');
  }
}

/** Add a new savings goal. */
function addSavingsGoal(name, target, startDate, endDate) {
  state.data.savingsGoals.push({
    id:        generateId(),
    name:      name,
    target:    parseFloat(target),
    startDate: startDate || todayStr(),
    endDate:   endDate || '',
    createdAt: todayStr()
  });
  saveData();
  renderBookkeeping();
  renderStatistics();
  showToast('攒钱目标已创建');
}

/**
 * Auto-compute saved amount: sum of all monthly surpluses
 * (income minus expense per month) from startDate to current month.
 * @param {string} startDate - YYYY-MM-DD
 * @returns {number}
 */
/**
 * Compute saved amount for a specific goal, respecting priority.
 * Goals are filled in array order. Earlier goals get surplus first.
 * @param {string} goalId - The goal's ID
 * @returns {number}
 */
/**
 * Compute saved amount for a goal with proper cascade priority.
 * Goals fill in array order. When a higher-priority goal reaches its target,
 * remaining surplus flows to the next goal.
 */
function computeGoalSaved(goalId) {
  var goal = state.data.savingsGoals.filter(function(g) { return g.id === goalId; })[0];
  if (!goal || !goal.startDate) return 0;

  // 1. Build chronological monthly surplus map (all time)
  var monthlySurplus = {};
  state.data.bills.forEach(function(b) {
    if (!b.date) return;
    var mKey = b.date.slice(0, 7);
    if (!monthlySurplus[mKey]) monthlySurplus[mKey] = 0;
    monthlySurplus[mKey] += b.type === 'income' ? b.amount : -b.amount;
  });

  var sortedMonths = Object.keys(monthlySurplus).sort();

  // 2. Simulate cascade: each goal fills from its start date, priority order
  var allocated = {}; // goalId -> amount filled so far
  var spentFromPool = {}; // month -> amount consumed by higher priorities

  for (var i = 0; i < state.data.savingsGoals.length; i++) {
    var g = state.data.savingsGoals[i];
    if (!g.startDate) continue;
    allocated[g.id] = 0;
    var target = g.target || Infinity;

    for (var j = 0; j < sortedMonths.length; j++) {
      var month = sortedMonths[j];
      if (month < g.startDate.slice(0, 7)) continue;

      var poolForThisMonth = monthlySurplus[month];
      var alreadyUsed = spentFromPool[month] || 0;
      var available = poolForThisMonth - alreadyUsed;

      if (available > 0 && allocated[g.id] < target) {
        var need = target - allocated[g.id];
        var take = Math.min(available, need);
        allocated[g.id] += take;
        spentFromPool[month] = (spentFromPool[month] || 0) + take;
      }
    }

    // If this is the goal we're querying, return its allocated amount
    if (g.id === goalId) {
      return Math.min(allocated[g.id], target);
    }
  }

  return 0;
}

/** Move a savings goal up in priority. */
function moveSavingsGoalUp(id) {
  var idx = -1;
  for (var i = 0; i < state.data.savingsGoals.length; i++) {
    if (state.data.savingsGoals[i].id === id) { idx = i; break; }
  }
  if (idx <= 0) return;
  var tmp = state.data.savingsGoals[idx - 1];
  state.data.savingsGoals[idx - 1] = state.data.savingsGoals[idx];
  state.data.savingsGoals[idx] = tmp;
  saveData();
  renderBookkeeping();
  renderStatistics();
}

/** Move a savings goal down in priority. */
function moveSavingsGoalDown(id) {
  var idx = -1;
  for (var i = 0; i < state.data.savingsGoals.length; i++) {
    if (state.data.savingsGoals[i].id === id) { idx = i; break; }
  }
  if (idx < 0 || idx >= state.data.savingsGoals.length - 1) return;
  var tmp = state.data.savingsGoals[idx + 1];
  state.data.savingsGoals[idx + 1] = state.data.savingsGoals[idx];
  state.data.savingsGoals[idx] = tmp;
  saveData();
  renderBookkeeping();
  renderStatistics();
}

/** Remove a savings goal by ID. */
function removeSavingsGoal(id) {
  if (!confirm('确定删除这个攒钱目标吗？')) return;
  state.data.savingsGoals = state.data.savingsGoals.filter(function(g) { return g.id !== id; });
  saveData();
  refreshAll();
  showToast('攒钱目标已删除');
}

// =====================================================================
// PAGE NAVIGATION
// =====================================================================

/**
 * Switch between the 4 main tabs.
 * @param {string} tab - 'bookkeeping' | 'finance' | 'statistics' | 'profile'
 */
/** Bubble messages — keyed by persona, then by tab. 3 presets each. */
var BUBBLE_MESSAGES = {
  'cool-guy': {
    bookkeeping: ['来，记一笔。', '今天的别忘了。', '记完我给你分析。'],
    finance:     ['想学什么？我教你。', '理财基础很重要。', '稳扎稳打，别急。'],
    statistics:  ['数据出来了，看看吧。', '分析好了。', '你的消费习惯还行。'],
    profile:     ['需要调整什么？', '设置在这里。', '改完告诉我。']
  },
  'sweet-girl': {
    bookkeeping: ['来和我AI记账吧~', '今天记账了吗？✨', '记一笔省一笔哦~'],
    finance:     ['来和我一起理财吧~', '今天学点理财知识？💛', '让钱生钱从小做起~'],
    statistics:  ['让我来帮你分析吧~', '看看这个月花了多少？📊', '你的消费习惯如何呢？'],
    profile:     ['来定制你的专属搭子~', '设置你的理财目标吧~', '随时可以调整我的人设哦~']
  }
};

function switchTab(tab) {
  var pageMap = {
    bookkeeping: 'pageBookkeeping',
    finance:     'pageFinance',
    statistics:  'pageStatistics',
    profile:     'pageProfile'
  };

  // Deactivate all pages
  var allPages = document.querySelectorAll('.page');
  for (var i = 0; i < allPages.length; i++) {
    allPages[i].classList.remove('page--active');
  }

  // Activate target page
  var pageEl = document.getElementById(pageMap[tab]);
  if (pageEl) pageEl.classList.add('page--active');

  // Update nav items
  var allNavItems = document.querySelectorAll('.nav-bar__item');
  for (var j = 0; j < allNavItems.length; j++) {
    allNavItems[j].classList.remove('nav-bar__item--active');
  }
  var navItem = document.querySelector('.nav-bar__item[data-tab="' + tab + '"]');
  if (navItem) navItem.classList.add('nav-bar__item--active');

  // Update bubble message
  updateNavBubble(tab);

  // Close AI chat if open
  if (state.aiChatOpen) closeAiChat();

  // Render statistics when switching to that tab
  if (tab === 'statistics') renderStatistics();
}

/** Update the bubble above + button with persona avatar and contextual message. */
function updateNavBubble(tab) {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var persona = AI_PERSONAS[personaKey] || AI_PERSONAS['cool-guy'];

  // Get persona-specific messages, fallback to sweet-girl for unknown personas
  var personaMsgs = BUBBLE_MESSAGES[personaKey] || BUBBLE_MESSAGES['sweet-girl'];
  var messages = personaMsgs[tab] || personaMsgs['bookkeeping'];
  var text = messages[Math.floor(Math.random() * messages.length)];

  var avatarEl = document.getElementById('navBubbleAvatar');
  if (avatarEl) avatarEl.src = persona.avatar;

  var textEl = document.getElementById('navBubbleText');
  if (textEl) textEl.textContent = text;

  // Show bubble if it was hidden
  var bubbleEl = document.getElementById('navBubble');
  if (bubbleEl) bubbleEl.style.display = '';
}

/** Navigate to previous month. */
function prevMonth() {
  if (state.currentMonth.month === 1) {
    state.currentMonth.month = 12;
    state.currentMonth.year--;
  } else {
    state.currentMonth.month--;
  }
  renderBookkeeping();
}

/** Navigate to next month (cannot exceed current real month). */
function nextMonth() {
  var now  = new Date();
  var cur  = state.currentMonth.year * 100 + state.currentMonth.month;
  var max  = now.getFullYear() * 100 + (now.getMonth() + 1);
  if (cur >= max) return;
  if (state.currentMonth.month === 12) {
    state.currentMonth.month = 1;
    state.currentMonth.year++;
  } else {
    state.currentMonth.month++;
  }
  renderBookkeeping();
}

// =====================================================================
// BOOKKEEPING PAGE RENDER
// =====================================================================

/** Render the full bookkeeping page. */
function renderBookkeeping() {
  renderMonthLabel();
  renderSummaryCards();
  renderBudget();
  renderTodayWeek();
  renderSavingsGoals();
  renderBillList();
}

function renderTodayWeek() {
  var today = todayStr();
  var todayIncome = 0, todayExpense = 0;
  var weekIncome = 0, weekExpense = 0;

  // Calculate week range (Mon-Sun)
  var now = new Date();
  var dayOfWeek = now.getDay(); // 0=Sun
  var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  var monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  state.data.bills.forEach(function(b) {
    if (b.date === today) {
      if (b.type === 'income') todayIncome += b.amount;
      else todayExpense += b.amount;
    }
    if (b.date >= toDateStr(monday) && b.date <= toDateStr(sunday)) {
      if (b.type === 'income') weekIncome += b.amount;
      else weekExpense += b.amount;
    }
  });

  document.getElementById('todayDate').textContent = (now.getMonth()+1) + '/' + now.getDate();
  document.getElementById('todayIncome').textContent = '¥' + todayIncome.toFixed(2);
  document.getElementById('todayExpense').textContent = '¥' + todayExpense.toFixed(2);
  document.getElementById('weekDate').textContent = (monday.getMonth()+1)+'/'+monday.getDate()+'-'+(sunday.getMonth()+1)+'/'+sunday.getDate();
  document.getElementById('weekIncome').textContent = '¥' + weekIncome.toFixed(2);
  document.getElementById('weekExpense').textContent = '¥' + weekExpense.toFixed(2);
}

function toDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function renderMonthLabel() {
  document.getElementById('monthLabel').textContent =
    state.currentMonth.year + '年' + state.currentMonth.month + '月';
  document.getElementById('headerDate').textContent =
    state.currentMonth.year + '/' + state.currentMonth.month;
}

function renderSummaryCards() {
  var bills       = getBillsForMonth();
  var totalExpense = 0;
  var totalIncome  = 0;

  bills.forEach(function(b) {
    if (b.type === 'expense') totalExpense += b.amount;
    else totalIncome += b.amount;
  });

  var balance = totalIncome - totalExpense;

  document.getElementById('sumExpense').textContent  = '¥' + totalExpense.toFixed(2);
  document.getElementById('sumIncome').textContent   = '¥' + totalIncome.toFixed(2);
  document.getElementById('sumBalance').textContent  = '¥' + balance.toFixed(2);
  document.getElementById('sumBalance').style.color   = balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)';
}

function renderBudget() {
  var bills       = getBillsForMonth();
  var totalExpense = 0;
  bills.forEach(function(b) {
    if (b.type === 'expense') totalExpense += b.amount;
  });

  var budget  = state.data.monthlyBudget;
  var usedPct = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;
  var fill    = document.getElementById('budgetFill');

  fill.style.width = usedPct + '%';

  var statusClass;
  if (usedPct > 90)       statusClass = 'progress-bar__fill--danger';
  else if (usedPct > 70)  statusClass = 'progress-bar__fill--warn';
  else                    statusClass = 'progress-bar__fill--safe';

  fill.className = 'progress-bar__fill ' + statusClass;

  document.getElementById('budgetUsed').textContent   = '已用 ¥' + totalExpense.toFixed(0);
  document.getElementById('budgetRemain').textContent = '剩余 ¥' + Math.max(budget - totalExpense, 0).toFixed(0);
}

function renderSavingsGoals() {
  var container = document.getElementById('savingsGoalsContainer');

  if (state.data.savingsGoals.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary);text-align:center;padding:8px 0">点击"设置"创建你的攒钱目标吧~</div>';
    return;
  }

  container.innerHTML = state.data.savingsGoals.map(function(g, idx) {
    var saved = computeGoalSaved(g.id);
    var pct   = g.target > 0 ? Math.min((saved / g.target) * 100, 100) : 0;
    var dateInfo = '';
    if (g.startDate) dateInfo += '从 ' + g.startDate;
    if (g.endDate)   dateInfo += ' 至 ' + g.endDate;
    var upStyle   = idx > 0 ? '' : 'opacity:0.25;pointer-events:none';
    var downStyle = idx < state.data.savingsGoals.length - 1 ? '' : 'opacity:0.25;pointer-events:none';
    var reorderBtns = '' +
      '<span class="savings-goal-item__reorder">' +
        '<span class="savings-goal-item__arrow" style="' + upStyle + '" onclick="event.stopPropagation();moveSavingsGoalUp(\'' + g.id + '\')">▲</span>' +
        '<span class="savings-goal-item__arrow" style="' + downStyle + '" onclick="event.stopPropagation();moveSavingsGoalDown(\'' + g.id + '\')">▼</span>' +
      '</span>';
    return '' +
      '<div class="savings-goal-item">' +
        '<div class="savings-goal-item__header">' +
          reorderBtns +
          '<span class="savings-goal-item__name" style="flex:1">' + g.name + '</span>' +
          '<span style="font-size:10px;color:var(--color-text-light)">优先级 ' + (idx + 1) + '</span>' +
          '<span class="savings-goal-item__delete" onclick="removeSavingsGoal(\'' + g.id + '\')">删除</span>' +
        '</div>' +
        (dateInfo ? '<div style="font-size:10px;color:var(--color-text-light);margin-bottom:2px">' + dateInfo + '</div>' : '') +
        '<div class="savings-bar"><div class="savings-bar__fill" style="width:' + pct + '%"></div></div>' +
        '<div class="savings-goal-item__stats">' +
          '<span>已存 ¥' + saved.toFixed(0) + '</span>' +
          '<span>目标 ¥' + g.target.toFixed(0) + '</span>' +
          '<span>' + pct.toFixed(1) + '%</span>' +
        '</div>' +
      '</div>';
  }).join('');
}

function renderBillList() {
  var bills = getBillsForMonth().slice(0, 10);
  var container = document.getElementById('billListContainer');

  if (bills.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state__icon">📭</div>' +
        '<div class="empty-state__text">暂无账单记录</div>' +
        '<div class="empty-state__hint">点击下方 + 号开始记账吧</div>' +
      '</div>';
    return;
  }

  container.innerHTML = bills.map(function(b) {
    var amountClass = b.type === 'expense' ? 'bill-item__amount--expense' : 'bill-item__amount--income';
    var sign        = b.type === 'expense' ? '-' : '+';
    return '' +
      '<div class="bill-item" onclick="showBillDetail(\'' + b.id + '\')">' +
        '<div class="bill-item__icon">' + (b.categoryIcon || '📌') + '</div>' +
        '<div class="bill-item__info">' +
          '<div class="bill-item__cat">' + (b.categoryName || b.category) + '</div>' +
          '<div class="bill-item__note">' + (b.note || '') + '</div>' +
        '</div>' +
        '<div class="bill-item__right">' +
          '<div class="bill-item__amount ' + amountClass + '">' + sign + '¥' + b.amount.toFixed(2) + '</div>' +
          '<div class="bill-item__date">' + (b.date ? b.date.slice(5) : '') + ' ' + (b.time || '') + '</div>' +
        '</div>' +
      '</div>';
  }).join('');
}

// =====================================================================
// FINANCE PAGE RENDER
// =====================================================================

/** Render the finance page. */
function renderFinance() {
  renderFinanceAssets();
  document.getElementById('investInput').value = state.data.settings.investmentAmount || '';
}

function renderFinanceAssets() {
  var totalIncome  = 0;
  var totalExpense = 0;

  state.data.bills.forEach(function(b) {
    if (b.type === 'income') totalIncome += b.amount;
    else totalExpense += b.amount;
  });

  var surplus     = Math.max(totalIncome - totalExpense, 0);
  var investAmt   = state.data.settings.investmentAmount || 0;
  var totalAssets = investAmt + surplus;

  document.getElementById('financeAssetsAmount').textContent = '¥' + totalAssets.toFixed(2);
}

/** Update the user's investment amount input. */
function updateInvestment() {
  var val = parseFloat(document.getElementById('investInput').value);
  if (val >= 0) {
    state.data.settings.investmentAmount = val;
    saveData();
    renderFinance();
    showToast('理财投入资金已更新');
  }
}

// =====================================================================
// STATISTICS PAGE RENDER
// =====================================================================

var app = null; // placeholder, set at bottom

function setupTrendSelects() {
  var now = new Date();
  var cy = now.getFullYear();
  var cm = now.getMonth() + 1;

  var ids = ['trendYearStart','trendYearEnd'];
  for (var i = 0; i < ids.length; i++) {
    var sel = document.getElementById(ids[i]);
    if (!sel || sel.options.length > 0) continue;
    for (var y = cy - 2; y <= cy; y++) {
      var opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      if (y === cy) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  var selMs = document.getElementById('trendMonthStart');
  if (selMs && selMs.options.length === 0) {
    for (var mm = 1; mm <= 12; mm++) {
      var opt = document.createElement('option');
      opt.value = mm; opt.textContent = mm + '月';
      if (mm === 1) opt.selected = true;
      selMs.appendChild(opt);
    }
  }

  var selMe = document.getElementById('trendMonthEnd');
  if (selMe && selMe.options.length === 0) {
    for (var mm2 = 1; mm2 <= 12; mm2++) {
      var opt2 = document.createElement('option');
      opt2.value = mm2; opt2.textContent = mm2 + '月';
      if (mm2 === cm) opt2.selected = true;
      selMe.appendChild(opt2);
    }
  }

  // Attach change handlers
  var allSels = [document.getElementById('trendYearStart'), document.getElementById('trendMonthStart'),
                 document.getElementById('trendYearEnd'), document.getElementById('trendMonthEnd')];
  for (var s = 0; s < allSels.length; s++) {
    if (allSels[s]) allSels[s].onchange = function() { renderTrendChart(null); };
  }
}

function togglePieMode(mode) {
  state.pieMode = mode;
  document.getElementById('btnPieMonth').className = 'stats-toggle__btn' + (mode === 'month' ? ' stats-toggle__btn--active' : '');
  document.getElementById('btnPieYear').className  = 'stats-toggle__btn' + (mode === 'year'  ? ' stats-toggle__btn--active' : '');
  renderCategoryPie();
}

function toggleInsightMode(mode) {
  state.insightMode = mode;
  document.getElementById('btnInsMonth').className = 'stats-toggle__btn' + (mode === 'month' ? ' stats-toggle__btn--active' : '');
  document.getElementById('btnInsYear').className  = 'stats-toggle__btn' + (mode === 'year'  ? ' stats-toggle__btn--active' : '');
  renderMonthlyInsight();
}

/** Render the full statistics page (called when tab is switched to). */
function renderStatistics() {
  // Populate trend range selects once
  setupTrendSelects();

  var allBills     = state.data.bills;
  var totalExpense  = 0;
  var totalIncome   = 0;
  var categoryMap   = {};
  var monthlyMap    = {};

  allBills.forEach(function(b) {
    if (b.type === 'expense') {
      totalExpense += b.amount;
      var catName = b.categoryName || b.category;
      categoryMap[catName] = (categoryMap[catName] || 0) + b.amount;
    } else {
      totalIncome += b.amount;
    }
    if (b.date) {
      var mKey = b.date.slice(0, 7);
      if (!monthlyMap[mKey]) monthlyMap[mKey] = { expense: 0, income: 0 };
      if (b.type === 'expense') monthlyMap[mKey].expense += b.amount;
      else monthlyMap[mKey].income += b.amount;
    }
  });

  renderStatsSummary(totalExpense, totalIncome, allBills.length);
  renderTrendChart(monthlyMap);
  renderCategoryPie(categoryMap);
  renderMonthlyInsight(monthlyMap, categoryMap);
  renderSavingsProgressStats();
}

function renderStatsSummary(totalExpense, totalIncome, totalCount) {
  document.getElementById('statsSummary').innerHTML =
    '<div class="stats-summary__item">' +
      '<div class="stats-summary__val" style="color:var(--color-expense)">¥' + totalExpense.toFixed(0) + '</div>' +
      '<div class="stats-summary__lbl">累计支出</div>' +
    '</div>' +
    '<div class="stats-summary__item">' +
      '<div class="stats-summary__val" style="color:var(--color-income)">¥' + totalIncome.toFixed(0) + '</div>' +
      '<div class="stats-summary__lbl">累计收入</div>' +
    '</div>' +
    '<div class="stats-summary__item">' +
      '<div class="stats-summary__val">¥' + (totalIncome - totalExpense).toFixed(0) + '</div>' +
      '<div class="stats-summary__lbl">总结余</div>' +
    '</div>' +
    '<div class="stats-summary__item">' +
      '<div class="stats-summary__val">' + totalCount + '</div>' +
      '<div class="stats-summary__lbl">总笔数</div>' +
    '</div>';
}

function rebuildMonthlyMap() {
  var map = {};
  state.data.bills.forEach(function(b) {
    if (!b.date) return;
    var mKey = b.date.slice(0, 7);
    if (!map[mKey]) map[mKey] = { expense: 0, income: 0 };
    if (b.type === 'expense') map[mKey].expense += b.amount;
    else map[mKey].income += b.amount;
  });
  return map;
}

function rebuildCategoryMap(period) {
  var map = {};
  var now = new Date();
  var cy = now.getFullYear();
  var cm = now.getMonth() + 1;
  var prefix = period === 'year' ? (cy + '-') : (cy + '-' + String(cm).padStart(2,'0'));

  state.data.bills.forEach(function(b) {
    if (!b.date) return;
    var match = period === 'year' ? b.date.startsWith(prefix) : b.date.startsWith(prefix);
    if (!match) return;
    if (b.type !== 'expense') return;
    var cat = b.categoryName || b.category;
    map[cat] = (map[cat] || 0) + b.amount;
  });
  return map;
}

function renderTrendChart(monthlyMap) {
  if (!monthlyMap) monthlyMap = rebuildMonthlyMap();

  // Read selected range from dropdowns
  var ys = parseInt(document.getElementById('trendYearStart').value) || new Date().getFullYear();
  var ms = parseInt(document.getElementById('trendMonthStart').value) || 1;
  var ye = parseInt(document.getElementById('trendYearEnd').value) || new Date().getFullYear();
  var me = parseInt(document.getElementById('trendMonthEnd').value) || (new Date().getMonth() + 1);

  // Build array of YYYY-MM keys in range
  var rangeMonths = [];
  var y = ys, m = ms;
  while (y < ye || (y === ye && m <= me)) {
    rangeMonths.push(y + '-' + String(m).padStart(2, '0'));
    m++;
    if (m > 12) { m = 1; y++; }
  }

  var months = rangeMonths;

  if (state.trendChart) state.trendChart.destroy();

  var ctx = document.getElementById('trendChart').getContext('2d');
  state.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(function(m) { return m.slice(5) + '月'; }),
      datasets: [
        {
          label: '支出',
          data: months.map(function(m) { var d = monthlyMap[m]; return d ? d.expense : 0; }),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255,107,107,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4
        },
        {
          label: '收入',
          data: months.map(function(m) { var d = monthlyMap[m]; return d ? d.income : 0; }),
          borderColor: '#4CD964',
          backgroundColor: 'rgba(76,217,100,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 20 }
        }
      }
    }
  });
}

function renderCategoryPie(categoryMap) {
  if (!categoryMap) categoryMap = rebuildCategoryMap(state.pieMode || 'month');
  var entries = [];
  for (var key in categoryMap) {
    if (categoryMap.hasOwnProperty(key)) entries.push([key, categoryMap[key]]);
  }
  entries.sort(function(a, b) { return b[1] - a[1]; });

  if (state.categoryChart) state.categoryChart.destroy();

  var ctx = document.getElementById('categoryPie').getContext('2d');
  state.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: entries.map(function(e) { return e[0]; }),
      datasets: [{
        data: entries.map(function(e) { return e[1]; }),
        backgroundColor: CHART_COLORS.slice(0, entries.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 12, font: { size: 11 } }
        }
      }
    }
  });
}

function renderMonthlyInsight(monthlyMap, categoryMap) {
  if (!monthlyMap) monthlyMap = rebuildMonthlyMap();
  if (!categoryMap) categoryMap = rebuildCategoryMap(state.insightMode || 'month');

  var curMonth = state.currentMonth.year + '-' + zeroPad(state.currentMonth.month);
  var curData  = monthlyMap[curMonth];
  var label    = state.insightMode === 'year' ? '本年' : '本月';
  var insight  = '暂无' + label + '数据。';

  if (state.insightMode === 'year') {
    // Aggregate year data
    var yTotalExpense = 0, yTotalIncome = 0;
    for (var key in monthlyMap) {
      if (monthlyMap.hasOwnProperty(key) && key.startsWith(String(state.currentMonth.year))) {
        yTotalExpense += monthlyMap[key].expense;
        yTotalIncome  += monthlyMap[key].income;
      }
    }
    if (yTotalExpense > 0 || yTotalIncome > 0) {
      var yTopEntry = null;
      var yTopVal = 0;
      for (var ck in categoryMap) {
        if (categoryMap.hasOwnProperty(ck) && categoryMap[ck] > yTopVal) {
          yTopVal = categoryMap[ck]; yTopEntry = ck;
        }
      }
      var yBudget = state.data.monthlyBudget * 12;
      insight = '📊 ' + label + '支出 <b>¥' + yTotalExpense.toFixed(2) + '</b>，收入 <b>¥' + yTotalIncome.toFixed(2) + '</b><br>' +
        '🔝 消费TOP1：<b>' + (yTopEntry || '无') + '</b>（¥' + (yTopVal || 0).toFixed(2) + '）<br>' +
        (yTotalExpense > yBudget ? '⚠️ <b style="color:var(--color-expense)">年支出较高</b>，请注意控制开支~' : '✅ 年度消费控制在合理范围！');
    }
  } else if (curData) {
    var topEntries = [];
    for (var ck2 in categoryMap) {
      if (categoryMap.hasOwnProperty(ck2)) topEntries.push([ck2, categoryMap[ck2]]);
    }
    topEntries.sort(function(a, b) { return b[1] - a[1]; });
    var topEntry = topEntries[0];
    var budget   = state.data.monthlyBudget;
    var over     = curData.expense > budget;

    insight  = '📊 ' + label + '支出 <b>¥' + curData.expense.toFixed(2) + '</b>，收入 <b>¥' + curData.income.toFixed(2) + '</b><br>';
    insight += '🔝 消费TOP1：<b>' + (topEntry ? topEntry[0] : '无') + '</b>（¥' + (topEntry ? topEntry[1].toFixed(2) : '0') + '）<br>';
    insight += over
      ? '⚠️ <b style="color:var(--color-expense)">已超预算！</b>超出 ¥' + (curData.expense - budget).toFixed(2) + '，请注意控制开支哦~'
      : '✅ 预算使用 ' + ((curData.expense / budget) * 100).toFixed(1) + '%，控制得不错！';
  }

  document.getElementById('monthlyInsight').innerHTML = insight;
}

function renderSavingsProgressStats() {
  var container = document.getElementById('savingsProgressStats');

  if (state.data.savingsGoals.length === 0) {
    container.innerHTML = '<div style="font-size:12px;color:var(--color-text-secondary);text-align:center;padding:10px">暂无攒钱目标，去记账页设置吧~</div>';
    return;
  }

  container.innerHTML = state.data.savingsGoals.map(function(g) {
    var saved = computeGoalSaved(g.id);
    var pct   = g.target > 0 ? Math.min((saved / g.target) * 100, 100) : 0;
    return '' +
      '<div class="savings-progress-item">' +
        '<div class="savings-progress-item__info">' +
          '<div class="savings-progress-item__name">' + g.name + '</div>' +
          '<div class="savings-progress-item__bar">' +
            '<div class="savings-progress-item__fill" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="savings-progress-item__pct">' + pct.toFixed(1) + '%</div>' +
      '</div>';
  }).join('');
}

// =====================================================================
// PROFILE PAGE RENDER
// =====================================================================

function renderProfile() {
  document.getElementById('profileNickname').textContent = state.data.settings.nickname;
  document.getElementById('settingNickname').textContent  = state.data.settings.nickname;
  updateSettingPersonaLabel();
}

/** Update the persona label shown in settings. */
function updateSettingPersonaLabel() {
  var persona = AI_PERSONAS[state.data.settings.aiPersona] || AI_PERSONAS['cool-guy'];
  var el = document.getElementById('settingPersona');
  if (el) el.textContent = persona.name + ' · ' + (persona.personality || '');
}

/**
 * Open a modal with persona cards for selection.
 * Globally confirms the choice.
 */
function showPersonaPicker() {
  var currentKey = state.data.settings.aiPersona || 'cool-guy';
  var cardsHtml = '';

  // Build cards for built-in + custom personas
  var personaKeys = ['cool-guy', 'sweet-girl'];
  if (AI_PERSONAS['custom'] && AI_PERSONAS['custom'].name !== '自定义') {
    personaKeys.push('custom');
  }

  personaKeys.forEach(function(key) {
    var p = AI_PERSONAS[key];
    var selected = key === currentKey ? ' persona-pick-card--selected' : '';
    cardsHtml += '' +
      '<div class="persona-pick-card' + selected + '" data-persona="' + key + '" id="pickCard_' + key + '">' +
        '<img class="persona-pick-card__avatar" src="' + p.avatar + '" alt="">' +
        '<div class="persona-pick-card__name">' + p.name + '</div>' +
        '<div class="persona-pick-card__desc">' + (p.personality || '') + '</div>' +
      '</div>';
  });

  var html = '' +
    '<div style="font-size:14px;font-weight:600;margin-bottom:12px">选择AI搭子人设</div>' +
    '<div class="persona-pick-cards">' + cardsHtml + '</div>';

  var pickedKey = currentKey;

  showModal('🎭 AI搭子人设', html, [
    { text: '取消', cls: 'btn--cancel', action: hideModal },
    { text: '确定', cls: 'btn--primary', action: function() {
      if (pickedKey !== currentKey) {
        changePersona(pickedKey);
      }
      hideModal();
    }}
  ]);

  // Bind card clicks after modal renders
  setTimeout(function() {
    personaKeys.forEach(function(key) {
      var card = document.getElementById('pickCard_' + key);
      if (!card) return;
      card.addEventListener('click', function() {
        // Deselect all
        document.querySelectorAll('.persona-pick-card').forEach(function(c) {
          c.classList.remove('persona-pick-card--selected');
        });
        // Select this one
        this.classList.add('persona-pick-card--selected');
        pickedKey = key;
      });
    });
  }, 50);
}

// =====================================================================
// AI CHAT OVERLAY (from + button)
// =====================================================================

function openAiChat() {
  state.aiChatOpen = true;
  // Sync persona title and avatar before showing
  updateWelcomeMessages();
  document.getElementById('aiChatOverlay').classList.add('chat-overlay--show');
  document.getElementById('mainOverlay').classList.add('overlay--show');
  setTimeout(function() {
    document.getElementById('aiChatInput').focus();
    scrollChatToBottom();
  }, 300);
}

function closeAiChat() {
  if (state.manualPanelOpen) closeManualBill();
  state.aiChatOpen = false;
  document.getElementById('aiChatOverlay').classList.remove('chat-overlay--show');
  document.getElementById('mainOverlay').classList.remove('overlay--show');
}

function scrollChatToBottom() {
  var el = document.getElementById('aiChatMessages');
  setTimeout(function() { el.scrollTop = el.scrollHeight; }, 100);
}

/**
 * Add a chat bubble to the AI chat overlay.
 * @param {string} role - 'user' | 'ai'
 * @param {string} html - Inner HTML content
 */
function addChatBubble(role, html) {
  var container = document.getElementById('aiChatMessages');
  var persona   = AI_PERSONAS[state.data.settings.aiPersona] || AI_PERSONAS['cool-guy'];

  if (role === 'ai') {
    // AI message with avatar
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    msgDiv.innerHTML =
      '<img class="chat-msg__avatar" src="' + persona.avatar + '" alt="">' +
      '<div class="chat-msg__bubble">' +
        '<div class="chat-bubble chat-bubble--ai">' + html + '</div>' +
      '</div>';
    container.appendChild(msgDiv);
  } else {
    // User message without avatar
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg chat-msg--user';
    msgDiv.innerHTML =
      '<div class="chat-msg__bubble">' +
        '<div class="chat-bubble chat-bubble--user">' + html + '</div>' +
      '</div>';
    container.appendChild(msgDiv);
  }
  scrollChatToBottom();
}

/** Show typing indicator then execute callback. */
function showAiTyping(callback, delay) {
  delay = delay || 800;
  var container = document.getElementById('aiChatMessages');
  var persona   = AI_PERSONAS[state.data.settings.aiPersona] || AI_PERSONAS['cool-guy'];

  var typing = document.createElement('div');
  typing.className = 'chat-msg';
  typing.innerHTML =
    '<img class="chat-msg__avatar" src="' + persona.avatar + '" alt="">' +
    '<div class="chat-msg__bubble">' +
      '<div class="chat-bubble chat-bubble--ai">' +
        '<div class="typing-indicator">' +
          '<span class="typing-indicator__dot"></span>' +
          '<span class="typing-indicator__dot"></span>' +
          '<span class="typing-indicator__dot"></span>' +
        '</div>' +
      '</div>' +
    '</div>';
  container.appendChild(typing);
  scrollChatToBottom();

  setTimeout(function() {
    typing.remove();
    callback();
  }, delay);
}

/**
 * Send a message in the AI chat (from + button).
 * This is the entry point for parsing user input and creating bills.
 */
function sendAiMessage() {
  var input = document.getElementById('aiChatInput');
  var text  = input.value.trim();
  if (!text) return;
  input.value = '';

  addChatBubble('user', escapeHtml(text));
  state.lastMessageTime = Date.now();

  showAiTyping(function() {
    // Send to AI for understanding (记账 intent detection + natural response)
    aiBookkeepingChat(text, function(err, response) {
      if (err) {
        // Fallback to local parsing on error
        var result = parseBillFromText(text);
        if (result) {
          saveBill(result);
          var sign = result.type === 'expense' ? '📤' : '📥';
          addChatBubble('ai', sign + ' 已自动记账 ¥' + result.amount.toFixed(2) + '（' + result.categoryName + '）');
        } else {
          addChatBubble('ai', formatAIError(err));
        }
        return;
      }

      // Check if AI returned a booking tag
      var bookingMatch = response.match(/\[BOOKKEEPING\]type=(\w+)\|amount=([\d.]+)\|category=(\w+)\|note=(.+)/);
      if (bookingMatch) {
        var billType = bookingMatch[1];
        var amount = parseFloat(bookingMatch[2]);
        var category = bookingMatch[3];
        var note = bookingMatch[4].trim();

        // Find category details
        var cats = billType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        var cat = cats.filter(function(c) { return c.key === category; })[0] || cats[cats.length - 1];

        saveBill({
          type: billType,
          amount: amount,
          category: cat.key,
          categoryIcon: cat.icon,
          categoryName: cat.name,
          note: note || cat.name,
          date: todayStr(),
          time: timeNow()
        });

        // Show AI's natural response (everything after the booking tag)
        var aiResponse = response.replace(/\[BOOKKEEPING\].*\n?/, '').trim();
        if (!aiResponse) aiResponse = '已记账 ¥' + amount.toFixed(2) + '（' + cat.name + '）';
        addChatBubble('ai', aiResponse + ' <span style="font-size:10px;color:var(--color-text-light)">✅ 已同步</span>');
      } else {
        // Pure conversation, no记账 intent
        addChatBubble('ai', response);
      }
    });
  });
}

/**
 * Get fallback AI chat response based on user's selected persona.
 * This can be replaced with a real API call.
 */
function getAiChatFallback() {
  var persona = state.data.settings.aiPersona;
  return AI_PERSONA_RESPONSES[persona] || AI_PERSONA_RESPONSES.warm;
}

/**
 * =====================================================================
 * AI API INTERFACE (RESERVED)
 * Replace this function body with a real API call when backend is ready.
 *
 * @param {string} message - User message
 * @param {string} context - Chat context ('bookkeeping' | 'finance')
 * @param {Function} callback - Called with (error, responseText)
 * =====================================================================
 */
function callAIAPI(message, context, callback) {
  // ---- LOCAL SIMULATION ----
  // Replace the code below with fetch() or SDK call to a real LLM API.

  if (context === 'bookkeeping') {
    // For bookkeeping context, parse bill locally (fast, no API needed)
    var result = parseBillFromText(message);
    callback(null, { parsed: result });
  } else if (context === 'finance') {
    // For finance Q&A, use local knowledge base
    var response = findFinanceResponse(message);
    callback(null, { text: response });
  }

  // ---- REAL API EXAMPLE (uncomment and replace when ready) ----
  // fetch('https://your-api-endpoint.com/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message: message, context: context })
  // })
  // .then(function(res) { return res.json(); })
  // .then(function(data) { callback(null, data); })
  // .catch(function(err) { callback(err); });
}

// =====================================================================
// MANUAL BILL PANEL
// =====================================================================

function openManualBill() {
  state.manualPanelOpen  = true;
  state.billType         = 'expense';
  state.selectedCategory = 'food';
  state.manualAmount     = '0';

  document.getElementById('manualNote').value = '';
  document.getElementById('manualDate').value = todayStr();

  renderManualPanel();
  document.getElementById('manualBillPanel').classList.add('manual-panel--show');
}

function closeManualBill() {
  state.manualPanelOpen = false;
  document.getElementById('manualBillPanel').classList.remove('manual-panel--show');
}

function setBillType(type) {
  state.billType         = type;
  state.selectedCategory = type === 'expense' ? 'food' : 'allowance';
  renderManualPanel();
}

function selectCategory(key) {
  state.selectedCategory = key;
  renderManualPanel();
}

function numpadInput(key) {
  if (key === 'del') {
    state.manualAmount = state.manualAmount.length > 1
      ? state.manualAmount.slice(0, -1)
      : '0';
  } else if (key === '.') {
    if (state.manualAmount.indexOf('.') === -1) {
      state.manualAmount += '.';
    }
  } else if (key === 'done') {
    saveManualBill();
    return;
  } else {
    if (state.manualAmount === '0') {
      state.manualAmount = key;
    } else {
      var parts = state.manualAmount.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return;
      state.manualAmount += key;
    }
  }
  renderManualPanel();
}

function saveManualBill() {
  var amount = parseFloat(state.manualAmount);
  if (amount <= 0) {
    showToast('请输入有效金额');
    return;
  }

  var cats = state.billType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  var cat  = cats.filter(function(c) { return c.key === state.selectedCategory; })[0] || cats[0];
  var note = document.getElementById('manualNote').value.trim() || cat.name;
  var date = document.getElementById('manualDate').value || todayStr();

  saveBill({
    type:         state.billType,
    amount:       amount,
    category:     cat.key,
    categoryIcon: cat.icon,
    categoryName: cat.name,
    note:         note,
    date:         date,
    time:         timeNow()
  });

  closeManualBill();
  showToast('记账成功！');
}

function renderManualPanel() {
  // ---- Type toggle ----
  var btnExpense = document.getElementById('btnTypeExpense');
  var btnIncome  = document.getElementById('btnTypeIncome');

  btnExpense.className = 'manual-panel__type-btn manual-panel__type-btn--expense';
  btnIncome.className  = 'manual-panel__type-btn manual-panel__type-btn--income';

  if (state.billType === 'expense') {
    btnExpense.classList.add('manual-panel__type-btn--active');
  } else {
    btnIncome.classList.add('manual-panel__type-btn--active');
  }

  // ---- Categories ----
  var cats        = state.billType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  var catContainer = document.getElementById('manualCategories');

  catContainer.innerHTML = cats.map(function(c) {
    var selClass = state.selectedCategory === c.key ? ' manual-panel__cat-item--selected' : '';
    return '' +
      '<div class="manual-panel__cat-item' + selClass + '" onclick="selectCategory(\'' + c.key + '\')">' +
        '<div class="manual-panel__cat-icon">' + c.icon + '</div>' +
        '<div class="manual-panel__cat-name">' + c.name + '</div>' +
      '</div>';
  }).join('');

  // ---- Amount display ----
  var display       = document.getElementById('manualAmountDisplay');
  var displayAmount = state.manualAmount.replace(/^0(\d)/, '$1');

  display.textContent = displayAmount;
  display.className   = 'manual-panel__amount manual-panel__amount--' +
    (state.billType === 'expense' ? 'expense' : 'income');

  // ---- Numpad ----
  var keys   = ['1','2','3','4','5','6','7','8','9','.','0','del'];
  var numpad = document.getElementById('manualNumpad');

  numpad.innerHTML = keys.map(function(k) {
    if (k === 'del') {
      return '<div class="manual-panel__num-key manual-panel__num-key--del" onclick="numpadInput(\'del\')">⌫</div>';
    }
    return '<div class="manual-panel__num-key" onclick="numpadInput(\'' + k + '\')">' + k + '</div>';
  }).join('') +
  '<div class="manual-panel__num-key manual-panel__num-key--done" onclick="numpadInput(\'done\')">完成</div>';
}

// =====================================================================
// FINANCE CONTENT (cards & quiz)
// =====================================================================

function showFinanceContent(type) {
  if (type === 'risk') {
    showRiskQuiz();
    return;
  }

  if (type === 'allocation') {
    showAllocationAdvice();
    return;
  }

  var info = FINANCE_KNOWLEDGE[type];
  if (info) {
    showModal(info.title, info.content);
  }
}

function showAllocationAdvice() {
  showModal(FINANCE_KNOWLEDGE.allocation.title, FINANCE_KNOWLEDGE.allocation.content);
}

/** Close quiz overlay and clear content. */
function closeQuiz() {
  document.getElementById('quizOverlay').classList.remove('overlay--show');
  var panel = document.getElementById('quizPanel');
  panel.innerHTML = '';
  panel.style.display = 'none';
}

function showRiskQuiz() {
  var qIdx      = 0;
  var scores    = [];
  var panel     = document.getElementById('quizPanel');
  var overlay   = document.getElementById('quizOverlay');
  panel.style.display = 'block';

  function renderQuestion() {
    if (qIdx >= RISK_QUIZ_QUESTIONS.length) {
      var total  = 0;
      scores.forEach(function(s) { total += s; });

      var result;
      if (total <= 3) {
        result = '🟢 <b>保守型投资者</b><br><br>你偏好安全稳健，不喜欢风险。建议从货币基金、定期存款等低风险方式开始，慢慢培养理财感觉。';
      } else if (total <= 5) {
        result = '🟡 <b>稳健型投资者</b><br><br>你能接受适度风险，适合均衡配置。可以考虑大部分资金放低风险产品，小部分尝试指数基金等。';
      } else if (total <= 7) {
        result = '🟠 <b>积极型投资者</b><br><br>你愿意承担较高风险以获取更高收益。建议加强专业知识学习，做好风险管理，不要把所有钱放在高风险产品上。';
      } else {
        result = '🔴 <b>激进型投资者</b><br><br>你有较强的风险承受能力，但作为大学生，建议还是要保留大部分资金在稳健产品中，不要过度冒险！';
      }

      // Store quiz result and check for retake inconsistency
      var prevScore = state.quizScore;
      state.quizScore = total;
      var retakeNote = '';
      if (prevScore !== null && Math.abs(prevScore - total) >= 3) {
        state.quizRetaken = true;
        retakeNote = '<div style="margin-top:10px;padding:10px;background:#FFF3D6;border-radius:8px;font-size:12px;color:#E6A500">' +
          '⚠️ 本次结果与上次差异较大（' + prevScore + ' → ' + total + '），建议重新认真做一次测试哦～</div>';
      } else if (prevScore !== null) {
        retakeNote = '<div style="margin-top:8px;font-size:11px;color:var(--color-text-light)">上次结果：' + prevScore + ' 分，本次一致 ✓</div>';
      }

      panel.innerHTML =
        '<div class="quiz-panel__title">测试结果</div>' +
        '<div class="quiz-panel__result">' + result + '</div>' +
        retakeNote +
        '<button class="btn btn--primary btn--block" onclick="closeQuiz()">知道了</button>';
      return;
    }

    var q = RISK_QUIZ_QUESTIONS[qIdx];
    var letters = ['A','B','C','D'];

    panel.innerHTML =
      '<div class="quiz-panel__title">风险认知测试 (' + (qIdx + 1) + '/' + RISK_QUIZ_QUESTIONS.length + ')</div>' +
      '<div class="quiz-panel__question">' + q.q + '</div>' +
      q.opts.map(function(opt, i) {
        return '<div class="quiz-option" onclick="window._quizAnswer(' + i + ')"><span class="quiz-option__letter">' + letters[i] + '.</span>' + opt + '</div>';
      }).join('');

    window._quizAnswer = function(score) {
      scores.push(score);
      qIdx++;
      renderQuestion();
    };
  }

  renderQuestion();
  overlay.classList.add('overlay--show');
}

// =====================================================================
// MODAL & TOAST UTILITIES
// =====================================================================

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('toast--show');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(function() {
    el.classList.remove('toast--show');
  }, 2000);
}

/**
 * Show a general modal dialog.
 * @param {string} title
 * @param {string} content - HTML content
 * @param {Array} buttons - Optional [{ text, cls, action }]
 */
function showModal(title, content, buttons) {
  var modalBox = document.getElementById('modalBox');
  var html = '' +
    '<div class="modal-box__title">' + title + '</div>' +
    '<div class="modal-box__desc">' + content + '</div>';

  if (buttons && buttons.length) {
    html += '<div class="modal-box__btns">' +
      buttons.map(function(b) {
        return '<button class="btn ' + b.cls + '">' + b.text + '</button>';
      }).join('') +
    '</div>';

    modalBox.innerHTML = html;

    // Bind button actions (only buttons inside modal-box__btns)
    var btnEls = modalBox.querySelectorAll('.modal-box__btns .btn');
    buttons.forEach(function(b, i) {
      if (btnEls[i] && b.action) {
        btnEls[i].addEventListener('click', b.action);
      }
    });
  } else {
    html += '<button class="btn btn--primary btn--block" id="btnModalClose">知道了</button>';
    modalBox.innerHTML = html;
    document.getElementById('btnModalClose').addEventListener('click', hideModal);
  }

  document.getElementById('modalOverlay').classList.add('modal-overlay--show');
}

function hideModal() {
  document.getElementById('modalOverlay').classList.remove('modal-overlay--show');
}

/** Show the import data modal (with textarea + file upload). */
function showImportModal() {
  var modalBox = document.getElementById('modalBox');
  modalBox.innerHTML = '' +
    '<div class="modal-box__title">📥 导入数据</div>' +
    '<div class="modal-box__desc">粘贴JSON数据或选择文件导入</div>' +
    '<textarea class="modal-box__textarea" id="importTextarea" placeholder="粘贴JSON数据到此处..."></textarea>' +
    '<input type="file" class="modal-box__file-input" id="importFileInput" accept=".json">' +
    '<div class="modal-box__hint">⚠️ 导入将覆盖当前所有数据</div>' +
    '<div class="modal-box__btns">' +
      '<button class="btn btn--cancel" id="btnImportCancel">取消</button>' +
      '<button class="btn btn--cancel" id="btnImportFile">📁 选择文件</button>' +
      '<button class="btn btn--primary" id="btnImportConfirm">确认导入</button>' +
    '</div>';

  document.getElementById('modalOverlay').classList.add('modal-overlay--show');

  document.getElementById('btnImportCancel').addEventListener('click', hideModal);
  document.getElementById('btnImportFile').addEventListener('click', function() {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput').addEventListener('change', handleFileImport);
  document.getElementById('btnImportConfirm').addEventListener('click', function() {
    var text = document.getElementById('importTextarea').value.trim();
    if (!text) { showToast('请粘贴数据或选择文件'); return; }
    if (importData(text)) hideModal();
  });
}

function handleFileImport(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('importTextarea').value = e.target.result;
  };
  reader.readAsText(file);
}

// =====================================================================
// PROFILE ACTIONS
// =====================================================================

/**
 * Show an in-app modal with input fields (replaces browser prompt).
 * @param {string} title - Modal title
 * @param {Array} fields - [{ id, label, type, placeholder, value }]
 * @param {Function} onConfirm - function(values) called with field values
 */
function showInputModal(title, fields, onConfirm) {
  var html = '';
  fields.forEach(function(f) {
    html += '<div style="text-align:left;font-size:12px;color:var(--color-text-secondary);margin-bottom:4px">' + f.label + '</div>';
    html += '<input class="modal-box__input" id="im_' + f.id + '" type="' + (f.type || 'text') + '" placeholder="' + (f.placeholder || '') + '" value="' + escapeHtml(f.value || '') + '">';
  });

  showModal(title, html, [
    { text: '取消', cls: 'btn--cancel', action: hideModal },
    { text: '确定', cls: 'btn--primary', action: function() {
      var values = {};
      var valid = true;
      fields.forEach(function(f) {
        var el = document.getElementById('im_' + f.id);
        values[f.id] = el ? el.value.trim() : '';
        if (f.required && !values[f.id]) valid = false;
      });
      if (!valid) { showToast('请填写所有必填项'); return; }
      hideModal();
      onConfirm(values);
    }}
  ]);
}

function editNickname() {
  showInputModal('修改昵称', [
    { id: 'nickname', label: '昵称', placeholder: '输入你的昵称', value: state.data.settings.nickname, required: true }
  ], function(values) {
    state.data.settings.nickname = values.nickname;
    saveData();
    renderProfile();
    showToast('昵称已更新');
  });
}

function changePersona(value) {
  state.data.settings.aiPersona = value;
  saveData();
  updateWelcomeMessages();
  updateSettingPersonaLabel();

  // Update bubble
  var persona = AI_PERSONAS[value] || AI_PERSONAS['cool-guy'];
  var avatarEl = document.getElementById('navBubbleAvatar');
  if (avatarEl) avatarEl.src = persona.avatar;
  // Update bubble text for current tab
  var activeTab = getCurrentTab();
  updateNavBubble(activeTab);

  showToast('AI人设切换为：' + persona.name);
}

/** Return the currently active tab name. */
function getCurrentTab() {
  var activeNav = document.querySelector('.nav-bar__item--active');
  return activeNav ? (activeNav.getAttribute('data-tab') || 'bookkeeping') : 'bookkeeping';
}

/** Open modal for custom persona editing. */
function editCustomPersona() {
  var customName   = state.data.settings.customPersonaName || '';
  var customPersonality = state.data.settings.customPersonaPersonality || '';
  var customPrompt = state.data.settings.customPersonaPrompt || '';
  window._customAvatarDataUrl = state.data.settings.customPersonaAvatar || '';

  var avatarSrc = window._customAvatarDataUrl || 'images/avatar-guyunsheng.png';
  var avatarStyle = window._customAvatarDataUrl ? '' : 'opacity:0.5';

  var html = '' +
    // Circular avatar upload
    '<div style="text-align:center;margin-bottom:14px">' +
      '<div class="custom-avatar-upload" id="customAvatarUpload" style="background-image:url(' + avatarSrc + ');' + avatarStyle + '">' +
        (window._customAvatarDataUrl ? '' : '<span style="font-size:24px;color:#fff">📷</span>') +
      '</div>' +
      '<input type="file" id="customAvatarFile" accept="image/*" style="display:none">' +
      '<div style="font-size:11px;color:var(--color-text-light);margin-top:6px" id="customAvatarHint">点击上传头像</div>' +
    '</div>' +
    // Name
    '<div style="text-align:left;font-size:12px;color:var(--color-text-secondary);margin-bottom:4px">名字</div>' +
    '<input class="modal-box__input" id="customName" placeholder="如：王小明" value="' + escapeHtml(customName) + '">' +
    // Personality
    '<div style="text-align:left;font-size:12px;color:var(--color-text-secondary);margin-bottom:4px">人设</div>' +
    '<input class="modal-box__input" id="customPersonality" placeholder="如：毒舌暖男" value="' + escapeHtml(customPersonality) + '">' +
    // Description
    '<div style="text-align:left;font-size:12px;color:var(--color-text-secondary);margin-bottom:4px">描述</div>' +
    '<textarea class="modal-box__textarea" id="customPersonaText" placeholder="描述TA的说话风格...&#10;例如：你是一个毒舌但很靠谱的理财顾问。">' + escapeHtml(customPrompt) + '</textarea>';

  showModal('✏️ 自定义AI搭子', html, [
    { text: '取消', cls: 'btn--cancel', action: hideModal },
    { text: '保存', cls: 'btn--primary', action: function() {
      var name = document.getElementById('customName').value.trim();
      var personality = document.getElementById('customPersonality').value.trim();
      var avatar = window._customAvatarDataUrl || '';
      var prompt = document.getElementById('customPersonaText').value.trim();

      if (!name) { showToast('请输入名字'); return; }
      if (!prompt) { showToast('请输入人设描述'); return; }

      state.data.settings.aiPersona = 'custom';
      state.data.settings.customPersonaName = name;
      state.data.settings.customPersonaPersonality = personality;
      state.data.settings.customPersonaAvatar = avatar;
      state.data.settings.customPersonaPrompt = prompt;

      AI_PERSONAS['custom'] = {
        key: 'custom', name: name,
        personality: personality || '自定义',
        avatar: avatar || 'images/avatar-guyunsheng.png',
        systemPrompt: prompt,
        welcomeMessage: '你好！我是' + name + '，你专属的理财搭子~'
      };

      saveData();
      updateWelcomeMessages();
      updateSettingPersonaLabel();
      hideModal();
      showToast('自定义AI搭子已保存：' + name);
    }}
  ]);

  // Bind upload
  setTimeout(function() {
    var uploadDiv = document.getElementById('customAvatarUpload');
    var fileInput = document.getElementById('customAvatarFile');
    if (uploadDiv && fileInput) {
      uploadDiv.addEventListener('click', function() { fileInput.click(); });
      fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          window._customAvatarDataUrl = ev.target.result;
          uploadDiv.style.backgroundImage = 'url(' + ev.target.result + ')';
          uploadDiv.style.opacity = '1';
          uploadDiv.innerHTML = '';
          var hint = document.getElementById('customAvatarHint');
          if (hint) hint.textContent = '已选择: ' + file.name;
        };
        reader.readAsDataURL(file);
      });
    }
  }, 100);
}

/** Trigger AI monthly analysis from the chat overlay. */
function aiAnalyzeMonthAction() {
  if (!state.aiChatOpen) return;

  addChatBubble('user', '📊 帮我分析本月消费');

  showAiTyping(function() {
    aiAnalyzeMonth(function(err, analysis) {
      if (err) {
        addChatBubble('ai', formatAIError(err || new Error('分析失败')));
        return;
      }
      addChatBubble('ai', analysis);
    });
  });
}

/** Trigger AI financial advice from the chat overlay. */
function aiAdviceAction() {
  if (!state.aiChatOpen) return;

  addChatBubble('user', '💡 请给我理财建议');

  showAiTyping(function() {
    aiFinancialAdvice(function(err, advice) {
      if (err) {
        addChatBubble('ai', formatAIError(err || new Error('获取建议失败')));
        return;
      }
      addChatBubble('ai', advice);
    });
  });
}

function confirmClearData() {
  showModal('⚠️ 确认清空数据',
    '此操作将清空所有本地数据（账单、预算、攒钱目标、设置），且不可恢复。确定要继续吗？',
    [
      { text: '取消',     cls: 'btn--cancel', action: hideModal },
      { text: '确认清空', cls: 'btn--danger', action: function() { clearAllData(); hideModal(); } }
    ]
  );
}

function showHelp() {
  showModal('📋 使用说明',
    '<div class="modal-box__desc--left" style="font-size:13px;line-height:1.8">' +
      '<b>📒 记账</b> — 查看账单、设置预算、攒钱目标<br>' +
      '<b>💡 理财</b> — 理财知识科普、风险测试、AI问答<br>' +
      '<b>📊 统计</b> — 收支图表、消费分析、攒钱进度<br>' +
      '<b>👤 我的</b> — 个人设置、数据导入导出<br>' +
      '<b>➕ 中心按钮</b> — AI智能记账 + 手动记账<br><br>' +
      '<b>💬 AI记账：</b>直接描述收支，AI自动识别<br>' +
      '<b>📝 手动记账：</b>精确录入每笔收支<br><br>' +
      '<b>⚠️ 注意：</b>数据仅保存在当前设备浏览器中，清除浏览器数据会导致数据丢失。建议定期导出备份！' +
    '</div>'
  );
}

function showAbout() {
  showModal('ℹ️ 关于我们',
    '<div style="text-align:center;font-size:14px;line-height:1.8">' +
      '<b>财小伴</b><br>' +
      '大学生理财陪伴AI智能体<br><br>' +
      '🐣 专为在校大学生设计<br>' +
      '📚 财商教育 + 理财陪伴<br>' +
      '🛡️ 不推荐产品，无营销属性<br>' +
      '💾 数据本地存储，安全私密<br><br>' +
      '<small style="color:var(--color-text-light)">Version 1.0 · Demo</small>' +
    '</div>'
  );
}

// =====================================================================
// EDIT BUDGET / SAVINGS (prompt-based)
// =====================================================================

function promptEditBudget() {
  showInputModal('设置本月预算', [
    { id: 'budget', label: '预算金额（元）', type: 'number', placeholder: '输入预算金额', value: String(state.data.monthlyBudget), required: true }
  ], function(values) {
    updateBudget(parseFloat(values.budget));
  });
}

function promptEditSavingsGoal() {
  showInputModal('新建攒钱目标', [
    { id: 'name', label: '目标名称', placeholder: '如：毕业旅行基金', value: '我的攒钱计划', required: true },
    { id: 'target', label: '目标金额（元）', type: 'number', placeholder: '如：5000', value: '', required: true },
    { id: 'startDate', label: '开始日期', type: 'date', value: todayStr(), required: true },
    { id: 'endDate', label: '目标完成日期（可选）', type: 'date', value: '' }
  ], function(values) {
    addSavingsGoal(values.name, values.target, values.startDate, values.endDate);
  });
}

/** Show year/month picker when clicking the month label. */
function showMonthPicker() {
  var y = state.currentMonth.year;
  var m = state.currentMonth.month;
  var html = '' +
    '<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:8px">' +
      '<input class="modal-box__input" id="mpYear" type="number" value="' + y + '" style="width:90px;text-align:center">' +
      '<span style="font-size:18px;font-weight:700">年</span>' +
      '<input class="modal-box__input" id="mpMonth" type="number" min="1" max="12" value="' + m + '" style="width:70px;text-align:center">' +
      '<span style="font-size:18px;font-weight:700">月</span>' +
    '</div>';

  showModal('📅 选择月份', html, [
    { text: '取消', cls: 'btn--cancel', action: hideModal },
    { text: '跳转', cls: 'btn--primary', action: function() {
      var newY = parseInt(document.getElementById('mpYear').value);
      var newM = parseInt(document.getElementById('mpMonth').value);
      if (newY > 2000 && newY < 2100 && newM >= 1 && newM <= 12) {
        state.currentMonth.year = newY;
        state.currentMonth.month = newM;
        renderBookkeeping();
        renderStatistics();
        hideModal();
      }
    }}
  ]);
}

/** Show mini calendar with daily balances. */
function showCalendarModal() {
  var y = state.currentMonth.year;
  var m = state.currentMonth.month;
  var daysInMonth = new Date(y, m, 0).getDate();
  var firstDow = new Date(y, m - 1, 1).getDay(); // 0=Sun

  // Calculate daily balances
  var prefix = y + '-' + String(m).padStart(2, '0');
  var dailyBal = {};
  state.data.bills.forEach(function(b) {
    if (!b.date || !b.date.startsWith(prefix)) return;
    dailyBal[b.date] = (dailyBal[b.date] || 0) + (b.type === 'income' ? b.amount : -b.amount);
  });

  // Build calendar grid
  var calHtml = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center">';
  var dowLabels = ['日','一','二','三','四','五','六'];
  dowLabels.forEach(function(d) {
    calHtml += '<div style="font-size:11px;color:var(--color-text-light);padding:4px 0">' + d + '</div>';
  });

  // Empty cells before first day
  for (var i = 0; i < firstDow; i++) {
    calHtml += '<div></div>';
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = prefix + '-' + String(d).padStart(2, '0');
    var bal = dailyBal[dateStr] || 0;
    var bg = bal > 0 ? 'rgba(76,217,100,0.15)' : (bal < 0 ? 'rgba(255,107,107,0.12)' : 'transparent');
    var color = bal > 0 ? 'var(--color-income)' : (bal < 0 ? 'var(--color-expense)' : 'var(--color-text)');
    calHtml += '' +
      '<div style="padding:4px 0;border-radius:6px;background:' + bg + ';cursor:default">' +
        '<div style="font-size:12px;font-weight:500">' + d + '</div>' +
        '<div style="font-size:9px;color:' + color + ';margin-top:1px">' + (bal !== 0 ? (bal > 0 ? '+' : '') + bal.toFixed(0) : '') + '</div>' +
      '</div>';
  }

  calHtml += '</div>';

  var title = y + '年' + m + '月';

  // Month navigation
  calHtml = '' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<button class="btn btn--sm btn--secondary" id="calPrevM">◀</button>' +
      '<span style="font-weight:700;font-size:15px">' + title + '</span>' +
      '<button class="btn btn--sm btn--secondary" id="calNextM">▶</button>' +
    '</div>' + calHtml;

  showModal('📅 每日结余', calHtml, [
    { text: '关闭', cls: 'btn--cancel', action: hideModal }
  ]);

  // Bind prev/next month
  setTimeout(function() {
    var prevBtn = document.getElementById('calPrevM');
    var nextBtn = document.getElementById('calNextM');
    if (prevBtn) prevBtn.addEventListener('click', function() {
      if (state.currentMonth.month === 1) { state.currentMonth.month = 12; state.currentMonth.year--; }
      else { state.currentMonth.month--; }
      hideModal();
      setTimeout(function() { showCalendarModal(); }, 200);
    });
    if (nextBtn) nextBtn.addEventListener('click', function() {
      var now = new Date();
      if (state.currentMonth.year * 100 + state.currentMonth.month < now.getFullYear() * 100 + (now.getMonth()+1)) {
        if (state.currentMonth.month === 12) { state.currentMonth.month = 1; state.currentMonth.year++; }
        else { state.currentMonth.month++; }
      }
      hideModal();
      setTimeout(function() { showCalendarModal(); }, 200);
    });
  }, 50);
}

// =====================================================================
// REFRESH ALL PAGES
// =====================================================================

function refreshAll() {
  renderBookkeeping();
  renderFinance();
  renderProfile();
}

// =====================================================================
// HELPER UTILITIES
// =====================================================================

/** Shallow merge objects. extend({}, defaults, overrides) */
function extend(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    if (source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
      }
    }
  }
  return target;
}

/** Pad number to 2 digits. */
function zeroPad(n) {
  return String(n).padStart(2, '0');
}

/** Generate a unique ID. */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Get today's date as YYYY-MM-DD. */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Get current time as HH:MM. */
function timeNow() {
  return new Date().toTimeString().slice(0, 5);
}

/** Random integer between min and max (inclusive). */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random amount based on type. */
function randomAmount(min, max, type) {
  var val = parseFloat((Math.random() * (max - min) + min).toFixed(2));
  if (type === 'expense') return Math.round(val);
  return Math.round(val / 10) * 10;
}

/** Build a lookup map from all categories. */
function buildCatLookup() {
  var map = {};
  EXPENSE_CATEGORIES.forEach(function(c) { map[c.key] = c; });
  INCOME_CATEGORIES.forEach(function(c)  { map[c.key] = c; });
  return map;
}

/** Escape HTML to prevent XSS in user messages. */
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// =====================================================================
// EVENT BINDING
// All click handlers bound here, not in HTML.
// =====================================================================

function bindEvents() {
  // ---- Bottom navigation ----
  var navItems = document.querySelectorAll('.nav-bar__item');
  navItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var tab = this.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // ---- Center oval + button (replaces FAB) ----
  document.getElementById('btnCenterAdd').addEventListener('click', function(e) {
    e.stopPropagation();
    if (state.aiChatOpen) {
      closeAiChat();
    } else {
      openAiChat();
    }
  });

  // ---- Bubble close button ----
  document.getElementById('navBubbleClose').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('navBubble').style.display = 'none';
  });

  // ---- Tutorial overlay (tap to advance) ----
  document.getElementById('tutorialOverlay').addEventListener('click', function() {
    advanceTutorial();
  });

  // ---- Persona selection cards ----
  var personaCards = document.querySelectorAll('.persona-card');
  personaCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      var persona = this.getAttribute('data-persona');
      if (persona) selectPersona(persona);
    });
  });

  // ---- AI Chat Overlay ----
  document.getElementById('btnCloseAiChat').addEventListener('click', closeAiChat);
  document.getElementById('btnSendAiMsg').addEventListener('click', sendAiMessage);
  document.getElementById('mainOverlay').addEventListener('click', function() {
    if (state.aiChatOpen) closeAiChat();
  });

  // AI chat input Enter key
  document.getElementById('aiChatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendAiMessage();
  });

  // ---- AI Analysis button ----
  document.getElementById('btnAiAnalysis').addEventListener('click', aiAnalyzeMonthAction);

  // ---- AI Advice button ----
  document.getElementById('btnAiAdvice').addEventListener('click', aiAdviceAction);

  // ---- Manual Bill Panel ----
  document.getElementById('btnOpenManualBill').addEventListener('click', openManualBill);
  document.getElementById('btnCancelManual').addEventListener('click', closeManualBill);
  document.getElementById('btnTypeExpense').addEventListener('click',  function() { setBillType('expense'); });
  document.getElementById('btnTypeIncome').addEventListener('click',   function() { setBillType('income'); });
  document.getElementById('btnSaveManual').addEventListener('click',   saveManualBill);

  // ---- Finance Page ----
  document.getElementById('btnUpdateInvest').addEventListener('click', updateInvestment);

  // Finance cards
  var financeCards = document.querySelectorAll('.finance-card');
  financeCards.forEach(function(card) {
    card.addEventListener('click', function() {
      var type = this.getAttribute('data-type');
      showFinanceContent(type);
    });
  });

  // ---- Bookkeeping Page ----
  document.getElementById('btnPrevMonth').addEventListener('click', prevMonth);
  document.getElementById('btnNextMonth').addEventListener('click', nextMonth);
  document.getElementById('monthLabel').addEventListener('click', showMonthPicker);
  document.getElementById('btnEditBudget').addEventListener('click', promptEditBudget);
  document.getElementById('btnEditSavings').addEventListener('click', promptEditSavingsGoal);
  document.getElementById('btnOpenCalendar').addEventListener('click', showCalendarModal);

  // ---- Profile Page ----
  document.getElementById('btnEditNickname').addEventListener('click', editNickname);
  document.getElementById('btnPickPersona').addEventListener('click', showPersonaPicker);
  document.getElementById('btnCustomPersona').addEventListener('click', editCustomPersona);
  document.getElementById('btnExportData').addEventListener('click', exportData);
  document.getElementById('btnImportData').addEventListener('click', showImportModal);
  document.getElementById('btnClearData').addEventListener('click', confirmClearData);
  document.getElementById('btnShowHelp').addEventListener('click', showHelp);
  document.getElementById('btnShowAbout').addEventListener('click', showAbout);
  document.getElementById('btnLoadTestData').addEventListener('click', loadTestData);

  // ---- Quiz overlay click-to-close ----
  document.getElementById('quizOverlay').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) {
      closeQuiz();
    }
  });

  // ---- Modal overlay click-to-close ----
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) hideModal();
  });
}

// =====================================================================
// SPLASH & TUTORIAL FLOW
// =====================================================================

/** Show animated splash screen, then transition to tutorial. */
/** Show animated splash screen, then transition to tutorial. */
function startSplash() {
  document.getElementById('splashScreen').style.display = 'flex';
  setTimeout(function() {
    showTutorial();
  }, 2600);
}

/** Hide splash, show tutorial. */
function showTutorial() {
  document.getElementById('splashScreen').style.display = 'none';
  state.tutorialStep = 0;
  renderTutorialStep();
  document.getElementById('tutorialOverlay').classList.add('tutorial--show');
}

/** Advance to next tutorial image, or show persona selection. */
function advanceTutorial() {
  state.tutorialStep++;
  if (state.tutorialStep >= TUTORIAL_STEPS.length) {
    showPersonaSelect();
  } else {
    renderTutorialStep();
  }
}

/** Render current tutorial step (image + dots). */
function renderTutorialStep() {
  var step = TUTORIAL_STEPS[state.tutorialStep];
  var card = document.getElementById('tutorialCard');
  card.style.backgroundColor = step.color;
  document.getElementById('tutorialCardText').textContent = step.text;

  var dotsHtml = '';
  for (var i = 0; i < TUTORIAL_STEPS.length; i++) {
    dotsHtml += '<span class="tutorial__dot' + (i === state.tutorialStep ? ' tutorial__dot--active' : '') + '"></span>';
  }
  document.getElementById('tutorialDots').innerHTML = dotsHtml;
}

/** Show persona selection screen after tutorial. */
function showPersonaSelect() {
  document.getElementById('tutorialOverlay').classList.remove('tutorial--show');
  document.getElementById('personaSelectOverlay').classList.add('persona-select--show');
}

/**
 * User selects a persona from the selection screen.
 * @param {string} personaKey - 'cool-guy' | 'sweet-girl'
 */
function selectPersona(personaKey) {
  state.data.settings.aiPersona = personaKey;
  saveData();
  document.getElementById('personaSelectOverlay').classList.remove('persona-select--show');
  enterApp();
  // Sync bubble after entering app
  setTimeout(function() { updateNavBubble('bookkeeping'); }, 100);
}

/** Reveal the main app UI after splash/tutorial/persona flow completes. */
function enterApp() {
  document.getElementById('appContainer').classList.remove('app-container--loading');
  state.splashDone = true;
  updateWelcomeMessages();
  updateSettingPersonaLabel();
}

/** Update welcome messages in chat overlays to match current persona. */
function updateWelcomeMessages() {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var persona = AI_PERSONAS[personaKey] || AI_PERSONAS['cool-guy'];

  // Update chat overlay title
  var titleEl = document.getElementById('chatOverlayTitle');
  if (titleEl) titleEl.textContent = persona.name;

  // Update chat overlay avatar
  var avatarEl = document.getElementById('aiChatAvatar');
  if (avatarEl) avatarEl.src = persona.avatar;

  // Update chat overlay welcome message
  var welcomeMsgEl = document.getElementById('aiChatWelcomeMsg');
  if (welcomeMsgEl) {
    var bubble = welcomeMsgEl.querySelector('.chat-bubble');
    if (bubble) bubble.innerHTML = persona.welcomeMessage +
      '<br><br>📝 <b>手动记账</b>：点击下方按钮，使用记账面板精确录入每笔收支。<br><br>' +
      '📊 <b>AI分析</b>：让AI帮你分析本月消费情况，给出省钱建议。<br><br>' +
      '💡 <b>理财建议</b>：根据你的资产情况，给出个性化理财配置建议。<br><br>' +
      '💬 <b>对话</b>：在下方输入框和我聊天，我会帮你记账和解答问题。';
  }
}

// =====================================================================
// INITIALIZATION
// =====================================================================

function init() {
  // Load data
  state.data = loadData();

  // Set current month
  var now = new Date();
  state.currentMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };

  // Set manual bill date default
  document.getElementById('manualDate').value = todayStr();

  // Initial render
  renderManualPanel();
  refreshAll();

  // Bind all events
  bindEvents();

  // Start splash → tutorial → persona → app flow
  startSplash();

  console.log('🐣 财小伴 - 大学生理财陪伴AI智能体');
  console.log('💾 数据存储：localStorage');
  console.log('📱 适配：375×812 移动端仿APP');
  console.log('✅ 就绪！');
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
