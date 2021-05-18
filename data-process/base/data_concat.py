import pandas as pd

# 读文件
df1 = pd.read_csv('./data/processed_data/user_profile3_cluster-type.csv', index_col = 'user_id')
df2 = pd.read_csv('./data/processed_data/raw_sample4_clk_count.csv', index_col = 'user_id')

df = pd.concat([df1, df2], axis = 1)

df.to_csv('./data/processed_data/user-profile3-cluster-type-clk-count.csv')