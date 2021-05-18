# 用于群体视图（单轴散点图）的topK用户行为统计
import pandas as pd
import json

df = pd.read_csv('../cluster/processed-data/user-profile3-behavior-cluster.csv', index_col = 'user_id')

topK = 10
# topK = 50

# for index, row in df.iterrows():
#     # series转str
#     rowStr = ','.join(str(i) for i in row)
#     if not temp_dic.__contains__(rowStr):
#         temp_dic[rowStr] = 0
#     temp_dic[rowStr] += 1

df0 = df[df['cluster_type'] == 0]
df1 = df[df['cluster_type'] == 1]
df2 = df[df['cluster_type'] == 2]
df3 = df[df['cluster_type'] == 3]
df4 = df[df['cluster_type'] == 4]

behaviors = ['pv', 'cart', 'fav', 'buy', 'clk']

cluster = []
# tempstr = ''

# 需要不断更改df0...df4，计算出值
for behavior in behaviors:
    tempDicArr = []
    for index, row in df4.nlargest(topK, behavior).iterrows():
        tempDicArr.append({
            'userID': index,
            'data': int(row[behavior])
        })
        # tempstr += 'user_id= \''+str(index)+'\' OR '
    cluster.append(tempDicArr)

print(cluster)
# cluster = tempstr

out = json.dumps(cluster)
jsonfile = open('./processed-data/topK-users-behaviors10000.json', 'w')
jsonfile.write(out)
print('success')