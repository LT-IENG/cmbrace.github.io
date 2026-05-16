import json, random
random.seed(42)

bills = []
bid = 0

def pad(n):
    return str(n).zfill(2)

expense_names = {
    'food': ['食堂午餐','食堂晚餐','外卖炸鸡','奶茶','早餐包子','麻辣烫','黄焖鸡','水果店','面包店','咖啡'],
    'transport': ['地铁通勤','公交','打车','共享单车'],
    'shopping': ['淘宝买衣服','京东买书','拼多多日用品','买护肤品','买鞋','买包'],
    'entertainment': ['电影票','游戏充值','KTV唱歌','视频会员','剧本杀'],
    'study': ['买教材','打印资料','考试报名费','文具','网课会员'],
    'daily': ['话费充值','买纸巾','洗衣液','牙膏牙刷','校园卡充值'],
    'social': ['室友聚餐','朋友生日礼物','班级聚会','请客吃饭'],
}
income_names = {
    'allowance': ['妈妈转生活费','爸爸给零花钱','家里给的生活费'],
    'parttime': ['周末家教','线上兼职','图书馆助理','帮老师做项目','发传单兼职'],
    'gift': ['奶奶给的红包','生日红包','过年红包','节日红包'],
    'scholarship': ['学业奖学金','比赛奖金','助学金'],
    'refund': ['淘宝退款','外卖退款','买书退货退款'],
}

def add_bill(typ, cat, icon, name, amount, date, time, note):
    global bid
    bills.append({
        'id': 't{}{}'.format(date.replace('-',''), bid),
        'type': typ, 'amount': amount, 'category': cat,
        'categoryIcon': icon, 'categoryName': name,
        'note': note, 'date': date, 'time': time
    })
    bid += 1

# Generate 2025-01 to 2026-05
for y in [2025, 2026]:
    end_m = 13 if y == 2025 else 6
    for m in range(1, end_m):
        days = 31 if m in [1,3,5,7,8,10,12] else (28 if m==2 else 30)

        # Allowance
        for _ in range(random.randint(1, 2)):
            d = random.randint(1, days)
            amt = random.randint(1600, 2200) if y == 2026 else random.randint(1400, 1800)
            add_bill('income', 'allowance', '💰', '生活费', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,22))}:{pad(random.randint(0,59))}',
                     random.choice(income_names['allowance']))

        # Part-time
        if random.random() < 0.7:
            for _ in range(random.randint(1, 3)):
                d = random.randint(1, days)
                add_bill('income', 'parttime', '💼', '兼职', random.randint(80, 400),
                         f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,22))}:{pad(random.randint(0,59))}',
                         random.choice(income_names['parttime']))

        # Red packets (holiday months)
        if m in [1, 2, 10]:
            for _ in range(random.randint(1, 3)):
                d = random.randint(1, days)
                add_bill('income', 'gift', '🎁', '红包', random.randint(50, 500),
                         f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,22))}:{pad(random.randint(0,59))}',
                         random.choice(income_names['gift']))

        # Scholarship (Sep)
        if m == 9:
            d = random.randint(1, days)
            add_bill('income', 'scholarship', '🏆', '奖学金', random.randint(1000, 3000),
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,18))}:{pad(random.randint(0,59))}',
                     random.choice(income_names['scholarship']))

        # Food (25-31 days)
        for _ in range(random.randint(25, min(days, 30))):
            d = random.randint(1, days)
            amt = round(random.uniform(6, 35), 1)
            if random.random() < 0.3: amt = round(amt)
            add_bill('expense', 'food', '🍔', '餐饮', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(7,21))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['food']))

        # Transport
        for _ in range(random.randint(8, 16)):
            d = random.randint(1, days)
            amt = round(random.uniform(2, 15), 1)
            if random.random() < 0.5: amt = round(amt)
            add_bill('expense', 'transport', '🚌', '交通', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(7,22))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['transport']))

        # Shopping
        for _ in range(random.randint(3, 6)):
            d = random.randint(1, days)
            amt = round(random.uniform(15, 120), 1)
            if random.random() < 0.4: amt = round(amt)
            add_bill('expense', 'shopping', '🛒', '购物', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,23))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['shopping']))

        # Entertainment
        for _ in range(random.randint(2, 4)):
            d = random.randint(1, days)
            amt = round(random.uniform(15, 80), 1)
            if random.random() < 0.3: amt = round(amt)
            add_bill('expense', 'entertainment', '🎮', '娱乐', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(10,23))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['entertainment']))

        # Study
        for _ in range(random.randint(1, 3)):
            d = random.randint(1, days)
            amt = round(random.uniform(5, 100), 1)
            if random.random() < 0.3: amt = round(amt)
            add_bill('expense', 'study', '📚', '学习', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,20))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['study']))

        # Daily
        for _ in range(random.randint(2, 3)):
            d = random.randint(1, days)
            amt = round(random.uniform(10, 60), 1)
            if random.random() < 0.3: amt = round(amt)
            add_bill('expense', 'daily', '🏠', '日用', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,21))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['daily']))

        # Social
        for _ in range(random.randint(1, 3)):
            d = random.randint(1, days)
            amt = round(random.uniform(20, 120), 1)
            if random.random() < 0.3: amt = round(amt)
            add_bill('expense', 'social', '❤️', '社交', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(11,22))}:{pad(random.randint(0,59))}',
                     random.choice(expense_names['social']))

        # Refunds (occasional)
        if random.random() < 0.4:
            d = random.randint(1, days)
            amt = round(random.uniform(10, 60), 1)
            add_bill('income', 'refund', '💵', '退款', amt,
                     f'{y}-{pad(m)}-{pad(d)}', f'{pad(random.randint(8,20))}:{pad(random.randint(0,59))}',
                     random.choice(income_names['refund']))

# Sort by date descending
bills.sort(key=lambda b: b['date'] + b['time'], reverse=True)

total_in = sum(b['amount'] for b in bills if b['type'] == 'income')
total_out = sum(b['amount'] for b in bills if b['type'] == 'expense')
surplus = total_in - total_out
print(f'Bills: {len(bills)} | Income: {total_in:.0f} | Expense: {total_out:.0f} | Surplus: {surplus:.0f}')

# Adjust to hit ~22560 surplus if not close
if abs(surplus - 22560) > 2000:
    print(f'Adjusting surplus from {surplus:.0f} to 22560...')
    # Scale expenses to hit target
    ratio = (total_in - 22560) / total_out if total_out > 0 else 1
    for b in bills:
        if b['type'] == 'expense':
            b['amount'] = round(b['amount'] * ratio, 2)
    total_out = sum(b['amount'] for b in bills if b['type'] == 'expense')
    surplus = total_in - total_out
    print(f'Adjusted: Income: {total_in:.0f} | Expense: {total_out:.0f} | Surplus: {surplus:.0f}')

data = {
    'bills': bills,
    'monthlyBudget': 1800,
    'savingsGoals': [
        {'id':'sg1','name':'毕业旅行基金','target':8000,'startDate':'2025-09-01','endDate':'2026-06-30','createdAt':'2025-09-01'},
        {'id':'sg2','name':'新电脑攒机','target':10000,'startDate':'2026-01-01','endDate':'2026-09-01','createdAt':'2026-01-01'},
    ],
    'settings': {'nickname':'小明同学','aiPersona':'cool-guy','investmentAmount':5000}
}

with open(r'e:\python learning\CMBrace\test-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Done!')
