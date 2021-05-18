import pandas as pd
import json

df = pd.read_csv('./processed-data/user-profile3-cluster-type-clk-top10.csv', index_col = 'user_id')

# print(df)

res_dic = {}
cluster_dic = {}

for index, row in df.iterrows():
    if not cluster_dic.__contains__(str(row['cluster_type'])):
        cluster_dic[str(row['cluster_type'])] = []
    cluster_dic[str(row['cluster_type'])].append({'index': index, 'row': row})

for key in cluster_dic:
    temp_arr = []
    for el in cluster_dic[key]:
        temp_arr.append({
            'user_id': str(el['index']),
            'cluster_type': str(el['row']['cluster_type']),
            'gender_code': str(el['row']['gender_code']),
            'age_level': str(el['row']['age_level']),
            'pvalue_level': str(el['row']['pvalue_level']),
            'shopping_level': str(el['row']['shopping_level']),
            'occupation_code': str(el['row']['occupation_code']),
            'city_level': str(el['row']['city_level']),
            'clk': int(el['row']['clk'])
        })
    res_dic[key] = temp_arr

print(res_dic)

out = json.dumps(res_dic)
jsonfile = open('./processed-data/use-profile3-cluster-parallel-sets-bar-chart.json', 'w')
jsonfile.write(out)
print('success')