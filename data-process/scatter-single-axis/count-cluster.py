import pandas as pd

def to_csv(df):
    print(df)

    data_count = df['cluster_type'].value_counts()

    data_count = data_count.to_frame()

    data_count.index.name = 'cluster_type'

    data_count.columns = ['cluster_count']

    print(data_count)

    data_count.to_csv('./processed-data/user-profile3-behavior-cluster-count.csv', header = True)

def to_json(df):
    print(df)

    data_count = df['cluster_type'].value_counts()

    data_count = data_count.to_frame()

    data_count.index.name = 'cluster_type'

    data_count.columns = ['cluster_count']

    print(data_count)

    data_count.to_json('./processed-data/user-profile3-behavior-cluster-count.json', orient='table')

if(__name__ == '__main__'):
    df = pd.read_csv('../cluster/processed-data/user-profile3-behavior-cluster.csv')
    to_csv(df)
    # to_json()