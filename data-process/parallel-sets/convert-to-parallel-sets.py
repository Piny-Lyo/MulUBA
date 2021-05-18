import pandas as pd

df = pd.read_csv('./processed-data/user-profile3-cluster-type.csv', index_col = 'user_id')

# print(df)

temp_dic = {}

res_arr = []

for index, row in df.iterrows():
    # series转str
    rowStr = ','.join(str(i) for i in row)
    if not temp_dic.__contains__(rowStr):
        temp_dic[rowStr] = 0
    temp_dic[rowStr] += 1

userProfileDic = {
    'gender_code': {
        '1': 'Male',
        '2': 'Female'
    },
    'age_level': {
        '0': '0-9',
        '1': '10-19',
        '2': '20-29',
        '3': '30-39',
        '4': '40-49',
        '5': '50-59',
        '6': '60-69'
    },
    'pvalue_level': {
        '1': 'Level 1',
        '2': 'Level 2',
        '3': 'Level 3'
    },
    'shopping_level': {
        '1': 'Level 1',
        '2': 'Level 2',
        '3': 'Level 3'
    },
    'occupation_code': {
        '0': 'No',
        '1': 'Yes'
    },
    'city_level': {
        '1': 'Level 1',
        '2': 'Level 2',
        '3': 'Level 3',
        '4': 'Level 4'
    },
}

for key in temp_dic:
    key_arr = key.split(",")
    res_arr.append({})
    res_arr[len(res_arr)-1]['cluster_type'] = str(key_arr[0])
    res_arr[len(res_arr)-1]['gender_code'] = userProfileDic['gender_code'][str(key_arr[1])]
    res_arr[len(res_arr)-1]['age_level'] = userProfileDic['age_level'][str(key_arr[2])]
    res_arr[len(res_arr)-1]['pvalue_level'] = userProfileDic['pvalue_level'][str(key_arr[3])]
    res_arr[len(res_arr)-1]['shopping_level'] = userProfileDic['shopping_level'][str(key_arr[4])]
    res_arr[len(res_arr)-1]['occupation_code'] = userProfileDic['occupation_code'][str(key_arr[5])]
    res_arr[len(res_arr)-1]['city_level'] = userProfileDic['city_level'][str(key_arr[6])]
    res_arr[len(res_arr)-1]['value'] = str(temp_dic[key])

print(res_arr)

df2 = pd.DataFrame(res_arr)

print(df2)

df2.to_csv('./processed-data/user-profile3-cluster-parallel-sets.csv', header = True, index = False)
