# -*- coding=utf-8 -*-
# 数据预处理 标准化
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

def standardizeMultiDim(df):
    scaler = StandardScaler()
    scaler.fit(df)
    stand_arr = scaler.transform(df)
    print(stand_arr)

    print("save standardized data")
    #保存结果
    pd.DataFrame(stand_arr, index = df.index, columns = df.columns).to_csv('./processed-data/user-profile3-behavior-standardized.csv')
    print("process done")

def standardizeOneDim(df):
    clk_count_df = df['clk_count']
    stand_ser = (clk_count_df - clk_count_df.min()) / (clk_count_df.max() - clk_count_df.min())
    print(stand_ser)

    print("save standardized data")
    #保存结果
    stand_ser.to_frame().to_csv('./processed-data/user-profile3-clk-standardized.csv')
    print("process done")
    
if(__name__ == '__main__'):
    df = pd.read_csv('./processed-data/user-profile3-behavior.csv', index_col = 'user_id')
    print("load csv finished.")
    print("standarlizing...")
    standardizeMultiDim(df)
    # standardizeOneDim(df)
