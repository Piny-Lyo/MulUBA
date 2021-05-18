# -*- coding=utf-8 -*-
# 
import numpy as np
from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
from collections import Counter
import pandas as pd

# 确定最佳k-means 聚类数量
# 参考
# https://blog.csdn.net/qq_15738501/article/details/79036255
def find_best_k(arr):
	arr = df.values
	SSE = []
	for k in range(1, 11):
		estimator = KMeans(n_clusters = k)
		estimator.fit(arr)
		print("finish kmeans round: %d"%k)
		SSE.append(estimator.inertia_)

	X = range(1, 11)
	plt.xlabel('k')
	plt.ylabel('SSE')
	plt.plot(X,SSE,'o-')
	plt.savefig('find-best-k.png', dpi=120)
	plt.show()

# kmeans聚类
def cluster_kmeans(df, k):
	arr = df.values
	print("start kmeans cluster... k = %d" %k)
	km = KMeans(n_clusters = k, random_state = 0)
	km.fit(arr)

	print("kmeans done. k = %d" %k)
	print_cluster_num(km.labels_)

	origin_df = pd.read_csv('./processed-data/user-profile-behavior.csv', index_col = 'user_id')
	res_df = pd.concat([origin_df, pd.Series(km.labels_, index = origin_df.index)], axis = 1)
	res_df.columns = list(origin_df.columns) + [u'cluster_type'] #重命名表头
	res_df.to_csv('./processed-data/user-profile3-behavior-cluster.csv')
	print("kmeans result saved")

# 打印出各分类标签的数量，以辅助确定t-sne perpelexity参数
def print_cluster_num(label):
	c = Counter(label.flatten())
	print(len(c.keys()))
	print(c)

if(__name__ == '__main__'):
	df = pd.read_csv('./processed-data/user-profile3-behavior-standardized.csv', index_col = 'user_id')
	print("load standardized success.")
	# find_best_k(df)
	cluster_kmeans(df, 5)

