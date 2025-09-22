import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import tw from "../../lib/tailwind";
import { useGetEventLogsQuery } from "../../state/features/services/events/events";
import InvitationItem from "./InvitationItem";
import images from "../../utils/constants/images";
import { useQuery } from "@tanstack/react-query";
import { newApi } from "../../state/newStates/flow";
import BaseText from "../BaseText";

const EventLogsListing = ({ navigation, eventId }: any) => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["event logs"],
    queryFn: async () => {
      let resp = await newApi.get("/api/events/event/invitees", {
        params: {
          eventId: eventId,
        },
      });
      return resp.data;
    },
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  console.log("eventLogs", data);

  // return (
  //   <View>
  //     <BaseText>{JSON.stringify(data)}</BaseText>
  //   </View>
  // );
  return (
    <View style={tw`flex-1 px-[5%]`}>
      <FlatList
        data={data?.data}
        renderItem={({ item }) => (
          <View style={tw`my-3`}>
            <InvitationItem
              item={item}
              // onPress={() => navigation.navigate("EventDetails")}
              image={images.event}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

export default EventLogsListing;

const styles = StyleSheet.create({});
