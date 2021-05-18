import pandas as pd

df = pd.read_csv('../origin-data/raw-sample4.csv')

print(df)

res_dic = {'clk': {}}

for index, row in df.iterrows():
    if not res_dic['clk'].__contains__(row['user_id']):
        res_dic['clk'][row['user_id']] = 0
    if str(row['clk']) == '1':
        res_dic['clk'][row['user_id']] += 1

print(res_dic)

df2 = pd.DataFrame(res_dic)

df2.index.name = 'user_id'

print(df2)

df2.to_csv('./processed-data/raw-sample4-clk.csv', header = True)