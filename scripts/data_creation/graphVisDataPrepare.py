import pandas as pd
import numpy as np

# node
idmap = pd.read_csv("..\..\generated\retailer_id_mapping.csv")
network = pd.read_csv("..\..\generated\retailer_network.csv")
orders = pd.read_csv("..\..\generated\data_for_viz.csv")

retailer=orders[["RETAILER_ID","RETAILER_NAME","RETAILER_TOTAL_SALES"]].groupby("RETAILER_ID",as_index=False).agg({"RETAILER_NAME":max,"RETAILER_TOTAL_SALES":sum,"RETAILER_TOTAL_SALES":"count"})
retailer = retailer.rename(columns={"RETAILER_TOTAL_SALES":"ORDER_TOTAL"})
retailer = retailer.merge(idmap[["RETAILER_ID","id"]],on="RETAILER_ID",how="inner")
retailer = retailer.merge(network,on="RETAILER_NAME",how="inner")
retailer.to_csv("..\..\generated\nodes.csv",index=False)

# link

dt = pd.read_csv("..\..\generated\data_for_graph.csv")
dt = dt[["target","source","amount"]]
dt = dt.rename(columns = {"amount":"value"})

target_active = dt.target.isin(retailer.id)
source_active = dt.source.isin(retailer.id)
active = target_active & source_active

dt[active].to_csv("..\..\generated\links.csv",index=False)