import pandas as pd
import numpy as np
import os
os.chdir(r"..\..")


# node
idmap = pd.read_csv(r"data\generated\retailer_id_mapping.csv")
network = pd.read_csv(r"data\generated\retailer_network.csv")
orders = pd.read_csv(r"data\generated\data_for_viz.csv")
clusters = pd.read_csv(r"data\generated\clustering_results.csv")

retailer=orders[["RETAILER_ID","RETAILER_NAME","RETAILER_TOTAL_SALES","RETAILER_PRICE_RANGE","RETAILER_CATEGORY"]].groupby("RETAILER_ID",as_index=False).\
	agg({"RETAILER_NAME":max,"RETAILER_TOTAL_SALES":sum,"RETAILER_CATEGORY":max,"RETAILER_PRICE_RANGE":max})
retailer = retailer.merge(idmap[["RETAILER_ID","id"]],on="RETAILER_ID",how="inner")
retailer = retailer.merge(network,on="RETAILER_NAME",how="inner")
retailer = retailer.merge(clusters,on=["RETAILER_NAME","RETAILER_ID"],how="inner")

retailer.to_csv(r"data\generated\nodes.csv",index=False)

# link

dt = pd.read_csv(r"data\generated\data_for_graph.csv")
dt = dt[["target","source","amount"]]
dt = dt.rename(columns = {"amount":"value"})

target_active = dt.target.isin(retailer.id)
source_active = dt.source.isin(retailer.id)
active = target_active & source_active

dt[active].to_csv(r"data\generated\links.csv",index=False)