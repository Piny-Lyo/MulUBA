# 统计用户信息，包括群体中点击广告的用户数、该群体用户数以及总用户数
# 统计行为信息，可能要尝试每种行为的总数、平均数等

import pandas as pd

df = pd.read_csv('../cluster/processed-data/user-profile3-behavior-cluster.csv')

res_dic = {'clk_users': {}, 'cluster_users': {}, 'total_users': {}, 'pv': {}, 'cart': {}, 'fav': {}, 'buy': {}, 'clk': {}}

for index, row in df.iterrows():
    if not res_dic['clk_users'].__contains__(row['cluster_type']):
        for key in res_dic:
            res_dic[key][row['cluster_type']] = 0
    # 点击广告的用户
    if int(row['clk']) != 0:
        res_dic['clk_users'][row['cluster_type']] += 1
    # 群体用户
    res_dic['cluster_users'][row['cluster_type']] += 1
    # pv
    res_dic['pv'][row['cluster_type']] += int(row['pv'])
    # cart
    res_dic['cart'][row['cluster_type']] += int(row['cart'])
    # fav
    res_dic['fav'][row['cluster_type']] += int(row['fav'])
    # buy
    res_dic['buy'][row['cluster_type']] += int(row['buy'])
    # clk
    res_dic['clk'][row['cluster_type']] += int(row['clk'])

# 总用户
for key in res_dic['cluster_users']:
    res_dic['total_users'][key] = df.shape[0]

print(res_dic)

df2 = pd.DataFrame(res_dic)

df2.index.name = 'cluster_type'

print(df2)

df2.to_csv('./processed-data/user-profile3-cluster-behavior-statics.csv', header = True)

