/* =====================================================================
   AI.JS — 财小伴 AI Module
   AI API integration, persona system, bookkeeping & finance intelligence.
   ===================================================================== */

// =====================================================================
// AI CONFIGURATION — Edit endpoint & key here
// =====================================================================

var AI_CONFIG = {
  endpoint: 'https://api.deepseek.com/chat/completions',
  apiKey: 'sk-7cb35a6f4f2d462ea601f935fd521da6',
  model: 'deepseek-chat',
  maxTokens: 600,
  temperature: 0.7,
  useMockFallback: true,
  contextMaxChars: 3000
};

// =====================================================================
// AI PERSONA DEFINITIONS
// Each persona: avatar image, name, personality label, system prompt.
// =====================================================================

var AI_PERSONAS = {
  'cool-guy': {
    key: 'cool-guy',
    name: '顾云生',
    personality: '高冷男神',
    avatar: 'images/avatar-guyunsheng.png',
    systemPrompt: '你叫"顾云生"，外冷内热的理财顾问。说话简洁但不冷漠，每句话点到即止但充满分量。会在细节处流露关心——比如提醒预算、关注大额支出。不用表情符号，不撒娇，但用户遇到问题时一定会给出最靠谱的建议。称呼用户为"你"。',
    welcomeMessage: '来了。今天想记什么？'
  },
  'sweet-girl': {
    key: 'sweet-girl',
    name: '林可可',
    personality: '可爱甜妹',
    avatar: 'images/avatar-linkeke.png',
    systemPrompt: '你叫"林可可"，是一个可爱、温柔、元气满满的女孩子。说话会用"呢""哦""呀""啦"等可爱语气词，喜欢用适度表情符号。像好朋友一样给出温暖的理财陪伴。称呼用户为"同学"或"你"。',
    welcomeMessage: '嗨～同学你好呀！我是你的理财小搭子林可可，有什么可以帮你的呢？💛'
  }
};

// Custom persona placeholder (populated at runtime)
AI_PERSONAS['custom'] = {
  key: 'custom',
  name: '自定义',
  personality: '自定义',
  avatar: 'images/avatar-guyunsheng.png',
  systemPrompt: '你是用户的专属理财搭子。',
  welcomeMessage: '你好！我是你专属的理财搭子~'
};

// =====================================================================
// CORE AI API CALL
// =====================================================================

function callAI(messages, callback) {
  if (!AI_CONFIG.endpoint || !AI_CONFIG.apiKey) {
    if (AI_CONFIG.useMockFallback) {
      var response = getMockAIResponse(messages);
      setTimeout(function() { callback(null, response); }, 600);
    } else {
      callback(new Error('AI API not configured'));
    }
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', AI_CONFIG.endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + AI_CONFIG.apiKey);
  xhr.timeout = 20000;

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        var text = data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message.content
          : (data.content || data.response || '');
        if (text) {
          callback(null, text);
        } else {
          callback(new Error('API 返回为空'));
        }
      } catch (e) {
        callback(new Error('API 响应解析失败'));
      }
    } else {
      var errMsg = '服务器错误 (' + xhr.status + ')';
      try {
        var errData = JSON.parse(xhr.responseText);
        if (errData.error && errData.error.message) {
          errMsg = errData.error.message;
        }
      } catch (e) {}
      callback(new Error(errMsg));
    }
  };

  xhr.onerror = function() {
    if (AI_CONFIG.useMockFallback) {
      callback(null, getMockAIResponse(messages));
    } else {
      callback(new Error('网络连接失败，请检查网络'));
    }
  };

  xhr.ontimeout = function() {
    if (AI_CONFIG.useMockFallback) {
      callback(null, getMockAIResponse(messages));
    } else {
      callback(new Error('AI 响应超时，请稍后重试'));
    }
  };

  xhr.send(JSON.stringify({
    model: AI_CONFIG.model,
    messages: messages,
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    stream: false
  }));
}

/**
 * Format an AI error into a persona-appropriate message.
 */
function formatAIError(err) {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var msg = err.message || '未知错误';
  if (personaKey === 'cool-guy') {
    return '出了点问题。' + msg + '。稍后重试。';
  }
  return '哎呀，好像出了点小问题呢～' + msg + '。稍后再试试看吧 💛';
}

/**
 * Build messages array with context window from conversation history.
 * @param {string} systemPrompt - The system prompt
 * @param {string} userMsg - Current user message
 * @returns {Array} messages array for API call
 */
function buildMessagesWithContext(systemPrompt, userMsg) {
  var messages = [{ role: 'system', content: systemPrompt }];
  var totalChars = systemPrompt.length;
  var maxChars = AI_CONFIG.contextMaxChars || 3000;

  // Add recent conversation history (newest first, then reverse)
  var history = (state.conversationHistory || []);
  var recentMsgs = [];
  for (var i = history.length - 1; i >= 0; i--) {
    var msg = history[i];
    var chars = (msg.content || '').length;
    if (totalChars + chars > maxChars) break;
    recentMsgs.unshift(msg);
    totalChars += chars;
  }

  // Add history messages
  for (var j = 0; j < recentMsgs.length; j++) {
    messages.push(recentMsgs[j]);
  }

  // Add current user message
  messages.push({ role: 'user', content: userMsg });

  return messages;
}

/**
 * Record a message pair in conversation history.
 */
function recordConversation(userMsg, aiMsg) {
  if (!state.conversationHistory) state.conversationHistory = [];
  state.conversationHistory.push({ role: 'user', content: userMsg });
  state.conversationHistory.push({ role: 'assistant', content: aiMsg });
  // Trim old messages if total exceeds 2x context window
  var total = 0;
  for (var i = state.conversationHistory.length - 1; i >= 0; i--) {
    total += (state.conversationHistory[i].content || '').length;
  }
  while (total > AI_CONFIG.contextMaxChars * 2 && state.conversationHistory.length > 2) {
    var removed = state.conversationHistory.shift();
    total -= (removed.content || '').length;
    removed = state.conversationHistory.shift();
    total -= (removed.content || '').length;
  }
}

// =====================================================================
// SYSTEM PROMPT BUILDER
// =====================================================================

function buildSystemPrompt(context) {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var persona = AI_PERSONAS[personaKey] || AI_PERSONAS['cool-guy'];
  var prompt = persona.systemPrompt + '\n\n';

  switch (context) {
    case 'bookkeeping':
      prompt += '【任务】用户正在进行记账。识别收支类型和金额，给出确认。如用户描述消费，分析是否合理。不推荐理财产品。';
      break;
    case 'finance':
      prompt += '【任务】用户咨询理财知识。用大学生能理解的方式解答。强调风险意识，不推荐具体产品。核心是财商教育。';
      break;
    case 'advice':
      prompt += '【任务】根据用户的闲钱资产和风险偏好，给出理财配置建议。强调低风险、稳健、适合学生。不推荐具体基金/股票代码。控制在200字以内。';
      break;
    case 'analysis':
      prompt += '【任务】分析用户本月收支数据。给出月度小结，指出最大支出类别，超预算提醒，一条实用建议。控制在150字以内。';
      break;
    default:
      prompt += '【任务】和用户聊天。保持角色设定，可以聊理财也可以聊日常。';
  }

  prompt += '\n始终保持角色设定。';
  return prompt;
}

// =====================================================================
// HIGH-LEVEL AI FUNCTIONS
// =====================================================================

function aiAnalyzeMonth(callback) {
  var bills = getBillsForMonth ? getBillsForMonth() : [];
  var totalExpense = 0, totalIncome = 0;
  var catMap = {};

  bills.forEach(function(b) {
    if (b.type === 'expense') {
      totalExpense += b.amount;
      var cat = b.categoryName || b.category;
      catMap[cat] = (catMap[cat] || 0) + b.amount;
    } else {
      totalIncome += b.amount;
    }
  });

  var topCats = Object.entries(catMap).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 3);
  var budget = state.data.monthlyBudget || 2500;
  var overBudget = totalExpense > budget;
  var catSummary = topCats.map(function(e) { return e[0] + ' ¥' + e[1].toFixed(0); }).join('、');

  var userMsg = '本月数据：支出¥' + totalExpense.toFixed(2) +
    ' 收入¥' + totalIncome.toFixed(2) +
    ' 预算¥' + budget +
    (overBudget ? ' 已超预算' : ' 预算内') +
    ' TOP3：' + catSummary;

  callAI([
    { role: 'system', content: buildSystemPrompt('analysis') },
    { role: 'user', content: userMsg }
  ], callback);
}

function aiFinanceChat(question, callback) {
  var msgs = buildMessagesWithContext(buildSystemPrompt('finance'), question);
  callAI(msgs, function(err, resp) {
    if (!err) recordConversation(question, resp);
    callback(err, resp);
  });
}

function aiBookkeepingChat(message, callback) {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var persona = AI_PERSONAS[personaKey] || AI_PERSONAS['cool-guy'];

  var systemPrompt = persona.systemPrompt + '\n\n' +
    '【重要任务】你需要判断用户输入是否为记账意图。\n' +
    '规则：\n' +
    '1. 如果用户明确表达了"花了/消费/支付/买了/用了"一笔具体金额，则为记账意图。回复格式：\n' +
    '   第一行：[BOOKKEEPING]type=expense|amount=金额|category=分类|note=备注\n' +
    '   第二行开始：你的自然语言回应（对这笔消费做出适当反应，如金额较大表示惊讶，金额合理表示认可）\n' +
    '2. 如果用户表达了"赚了/收到/收入/兼职"一笔具体金额，则为记账意图。回复格式同上，type=income。\n' +
    '3. 如果用户是提问、假设、商量（如"要不要花""该不该买""你觉得呢""如果"），则不是记账意图。直接自然回应即可，不要输出[BOOKKEEPING]标签。\n' +
    '4. 分类选项：food/transport/shopping/entertainment/study/daily/medical/social/digital/other(支出) 或 allowance/parttime/gift/scholarship/refund/other(收入)\n' +
    '5. 金额必须是用户明确说出的数字，不要猜测。如果没有明确数字，不要记账。\n' +
    '6. 记账回应要简洁，一两句话即可。';

  callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ], callback);
}

function aiChat(message, callback) {
  var msgs = buildMessagesWithContext(buildSystemPrompt('chat'), message);
  callAI(msgs, function(err, resp) {
    if (!err) recordConversation(message, resp);
    callback(err, resp);
  });
}

/**
 * AI-powered financial advice based on user's assets and risk profile.
 */
function aiFinancialAdvice(callback) {
  var totalIncome = 0, totalExpense = 0;
  state.data.bills.forEach(function(b) {
    if (b.type === 'income') totalIncome += b.amount;
    else totalExpense += b.amount;
  });
  var surplus = Math.max(totalIncome - totalExpense, 0);
  var investAmt = state.data.settings.investmentAmount || 0;

  var userMsg = '闲钱资产：¥' + (investAmt + surplus).toFixed(2) +
    '（投入¥' + investAmt.toFixed(2) + ' + 结余¥' + surplus.toFixed(2) + '）。';

  // Include risk quiz result if available
  if (state.quizScore !== null && state.quizScore !== undefined) {
    var riskLevel = state.quizScore <= 3 ? '保守型' : (state.quizScore <= 5 ? '稳健型' : (state.quizScore <= 7 ? '积极型' : '激进型'));
    userMsg += ' 风险测试结果：' + riskLevel + '（' + state.quizScore + '分）。请根据此风险偏好给出建议。';
  } else {
    userMsg += ' 我还没有做过风险测试，请先建议我去做风险认知测试（在理财页面的卡片中），然后再来获取个性化建议。';
  }

  callAI([
    { role: 'system', content: buildSystemPrompt('advice') },
    { role: 'user', content: userMsg }
  ], callback);
}

// =====================================================================
// MOCK AI RESPONSES
// =====================================================================

function getMockAIResponse(messages) {
  var personaKey = state.data.settings.aiPersona || 'cool-guy';
  var persona = AI_PERSONAS[personaKey] || AI_PERSONAS['cool-guy'];
  var tone = personaKey;

  var userMsg = '';
  for (var i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') { userMsg = messages[i].content; break; }
  }
  var sysMsg = messages[0] ? messages[0].content : '';

  // Analysis context
  if (sysMsg.indexOf('分析用户本月收支') !== -1) {
    var expenseMatch = userMsg.match(/支出¥([\d.]+)/);
    var overMatch = userMsg.match(/已超预算/);
    var expense = expenseMatch ? expenseMatch[1] : '?';
    if (tone === 'cool-guy') {
      return '本月支出¥' + expense + '。' + (overMatch ? '超出预算了，注意控制开支。' : '在预算内，保持住。') + '数据不会说谎，继续记。';
    }
    return '本月支出¥' + expense + '呢～' + (overMatch ? '超预算啦，要注意哦！' : '在预算内，很棒！') + '继续加油呀 💛';
  }

  // Finance Q&A context
  if (sysMsg.indexOf('用户咨询理财知识') !== -1) {
    return getMockFinanceAnswer(userMsg, tone);
  }

  // Advice context
  if (sysMsg.indexOf('理财配置建议') !== -1) {
    if (tone === 'cool-guy') {
      return '闲钱分三份：50%活期备用，30%货币基金，20%定存。不碰高风险。简单够用。';
    }
    return '建议把你的闲钱分成三份哦～50%放活期随时用，30%放货币基金赚点小利息，20%存定期强制储蓄！大学生阶段稳字当头，先别碰高风险的东西呢 💛';
  }

  // Bookkeeping context
  if (sysMsg.indexOf('用户正在进行记账') !== -1) {
    if (tone === 'cool-guy') return '收到。金额已记下，记得月底看分析。';
    return '好的呢～已经帮你记好啦！要继续保持记账的好习惯哦 ✨';
  }

  // Default chat
  if (tone === 'cool-guy') return '说。';
  return '嗨～同学！我是林可可呀，你的理财小搭子！有什么想问的都可以告诉我哦 🍬';
}

function getMockFinanceAnswer(question, tone) {
  if (question.indexOf('基金') !== -1) {
    if (tone === 'cool-guy') return '基金有风险。货基稳，股基波动大。先学再碰。';
    return '基金就是交给专业的人帮你投资啦～新手可以先了解货币基金哦，风险比较低呢！不过一定要先学习再尝试呀 💛';
  }
  if (question.indexOf('股票') !== -1) {
    if (tone === 'cool-guy') return '别碰。学生先学知识，别拿生活费炒股。';
    return '股票风险很大呢！作为学生党，不太建议拿生活费去炒股哦～可以先模拟学习，等以后有稳定收入了再考虑呢 📚';
  }
  if (question.indexOf('攒钱') !== -1 || question.indexOf('省钱') !== -1) {
    if (tone === 'cool-guy') return '记账→设目标→自动转存。少外卖，多食堂。';
    return '攒钱小技巧来啦～📝 记账、🎯 设目标、💰 先存后花！食堂比外卖省很多呢，一起加油呀！';
  }
  if (tone === 'cool-guy') return '先记账，再理财。搞清楚钱去哪了。';
  return '理财最重要的是先记账哦！了解自己的消费习惯，才能做出好的规划呢～有什么具体问题都可以问我呀 🐣';
}
