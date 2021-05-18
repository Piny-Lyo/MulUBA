import pandas as pd

df = pd.read_csv('./data/origin_data/behavior_log3.csv')

print(df)

res_dic = {'pv': {}, 'cart': {}, 'fav': {}, 'buy': {}}

for index, row in df.iterrows():
    if not res_dic['pv'].__contains__(row['user_id']):
        res_dic['pv'][row['user_id']] = 0
        res_dic['cart'][row['user_id']] = 0
        res_dic['fav'][row['user_id']] = 0
        res_dic['buy'][row['user_id']] = 0
    res_dic[row['btag']][row['user_id']] += 1

print(res_dic)

df2 = pd.DataFrame(res_dic)

df2.index.name = 'user_id'

print(df2)

df2.to_csv('./data/processed_data/behavior_log3_shopping_behavior.csv', header = True)