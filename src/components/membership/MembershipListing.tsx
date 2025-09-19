import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import TextPrimary from "../texts/text";
import tw from "../../lib/tailwind";
import InputText from "../inputs/InputText";
import icons from "../../utils/constants/icons";
import OrgMembershipItem from "./OrgMembershipItem";
import { useGetUserOrganizationMembershipQuery } from "../../state/features/services/membership/membership";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "../../utils/constants";
import { newApi } from "../../state/newStates/flow";
import { useQuery } from "@tanstack/react-query";
import BaseText from "../BaseText";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";

const MembershipListing = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const temp = useRef("");

  // const { data, isLoading, refetch, isFetching } =
  //   useGetUserOrganizationMembershipQuery("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["membership_list_organization", searchQuery],
    retryDelay: 1,
    queryFn: async () => {
      if (searchQuery.trimEnd()) {
        let resp = await newApi.get(
          "api/memberships-subscriptions/organization/members/search?search=kacey",
        );
        return resp.data;
      }

      let resp = await newApi.get(
        "/api/memberships-subscriptions/organization/membership",
        {
          // params: {
          //   filter: "active",
          // },
        },
      );
      return resp.data;
    },
  });
  const HeaderComponent = () => {
    return (
      <View style={tw`flex flex-row items-center gap-2 mx-4 mt-4`}>
        <View style={tw`flex-1`}>
          {/*<BaseText>{accountType}</BaseText>*/}
          <InputText
            onChangeText={(e) => {
              temp.current = e;
            }}
            icon={icons.search}
            defaultValue={searchQuery}
            placeholder="Search"
            style={tw`border border-[#484848] rounded-[10px] h-[36px]`}
          />
          {/*<TextInput />*/}
        </View>
        <TouchableOpacity
          style={tw`bg-primary rounded-[10px] p-2`}
          onPress={() => {
            if (!temp.current.trim()) {
              return;
            }
            // console.log(temp.current);
            setSearchQuery(temp.current);
          }}
        >
          <BaseText>
            <Feather name="search" size={18} color="white" />
          </BaseText>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-red-500 rounded-[10px] p-2`}
          onPress={() => {
            temp.current = "";
            setSearchQuery("");
          }}
        >
          <Feather name="x" size={18} color="white" />
        </TouchableOpacity>
      </View>
    );
  };
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
  const list_data = data?.data || [];
  // const filteredData = data?.data?.filter((item) => {
  //   const fullName =
  //     `${item.individual.firstName} ${item.individual.lastName}`.toLowerCase();
  //   const email = item.individual.email?.toLowerCase() || "";

  //   return (
  //     fullName.includes(searchQuery.toLowerCase()) ||
  //     email.includes(searchQuery.toLowerCase())
  //   );
  // });
  // return (
  //   <>
  //     <BaseText>{JSON.stringify(data)}</BaseText>
  //   </>
  // );
  return (
    <View style={tw``}>
      <FlatList
        data={list_data}
        renderItem={({ item }) => (
          <View style={tw`mt-5 mx-2  flex-1`}>
            <OrgMembershipItem
              onPress={() =>
                navigation.navigate("MemberPreview", { data: item })
              }
              item={item.individual}
              status={item.status}
            />
          </View>
        )}
        numColumns={2}
        style={tw` mt-0 `}
        contentContainerStyle={tw`pb-24 gap-2`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching || isLoading}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={<HeaderComponent />}
      />
    </View>
  );
};

export default MembershipListing;

const styles = StyleSheet.create({});
