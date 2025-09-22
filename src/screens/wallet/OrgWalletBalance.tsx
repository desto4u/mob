import { RefreshControl, TouchableOpacity, View } from "react-native";
import InputText from "../../components/inputs/InputText";
import tw from "../../lib/tailwind";
import icons from "../../utils/constants/icons";
import BaseText from "../../components/BaseText";
import Feather from "@expo/vector-icons/Feather";
import { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/PageContainer";
import BackButton from "../../components/BackButton";
import Header from "../../components/texts/header";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import {
  GoToOrgSubscriptions,
  TransactionItem,
  TRANSACTTION_API_RESPONSE,
} from "./WalletBalance";
import { newApi } from "../../state/newStates/flow";
import PrimaryButton from "../../components/buttons/PrimaryButtom";
import MaterialErrorComponent from "../../components/errors/ErrorComp";

export default function OrgWalletBalance() {
  const nav = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const query = useQuery<TRANSACTTION_API_RESPONSE>({
    queryKey: ["transactions", currentPage, searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        let resp = await newApi.get(
          "/api/memberships-subscriptions/get/organization/transactions",
          {
            params: {
              page: currentPage,
              limit: limit,
            },
          },
        );
        return resp.data;
      }
      let resp = await newApi.get(
        "/api/memberships-subscriptions/get/organization/transactions/search",
        {
          params: {
            searchParam: searchTerm,
            page: currentPage,
            limit: limit,
          },
        },
      );
      return resp.data;
    },
  });
  if (query.isError) {
    return (
      <PageContainer>
        <View
          style={tw`px-4  pb-2 flex flex-row border-b border-neutral-500/20 pb-4  `}
        >
          <BackButton onPress={(e) => nav.goBack()} />
          <Header style={tw`mx-auto`}>Transaction History</Header>
          <GoToOrgSubscriptions />
          {/* Balance Card */}
        </View>
        <MaterialErrorComponent
          //@ts-ignore
          message={query?.error?.response?.data?.message}
          // backButton
          onRetry={query.refetch}
        ></MaterialErrorComponent>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <View
        style={tw`px-4  pb-2 flex flex-row border-b border-neutral-500/20 pb-4  `}
      >
        <BackButton onPress={(e) => nav.goBack()} />
        <Header style={tw`mx-auto`}>Transaction History</Header>
        <GoToOrgSubscriptions />
        {/* Balance Card */}
      </View>
      <View style={tw`flex-1 pt-2`}>
        <View style={tw`pt-2`}>
          <HeaderComponent setSearchTerm={setSearchTerm} />
        </View>
        <FlashList
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching}
              onRefresh={query.refetch}
            />
          }
          // refreshing={query.isFetching}
          // onre
          ListEmptyComponent={() => {
            return (
              <View>
                <BaseText style={tw`text-center`}>
                  No transactions found
                </BaseText>
              </View>
            );
          }}
          contentContainerStyle={tw`px-1 pt-2`}
          data={query.data?.data || []}
          renderItem={({ index, item }) => {
            return <TransactionItem transaction={item} key={item.id} />;
          }}
          // ListHeaderComponent={HeaderComponent}
          ListFooterComponent={() => (
            <View
              style={tw`py-6 flex flex-row items-center justify-center gap-4`}
            >
              <PrimaryButton
                style={tw`px-4 py-1`}
                onPress={() => {
                  if (currentPage > 2) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
              >
                <BaseText
                  style={tw`text-xl  font-medium text-blue- bg dark:text-blue-400 capitalize`}
                >
                  -
                </BaseText>
              </PrimaryButton>
              <BaseText style={tw`text-center text-gray-500`}>
                Page: {currentPage}
              </BaseText>
              <PrimaryButton
                style={tw`px-4 py-1`}
                onPress={() => {
                  if (query.data?.data?.length == limit) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
              >
                <BaseText
                  style={tw`text-xl font-medium text-blue- bg dark:text-blue-400 capitalize`}
                >
                  +
                </BaseText>
              </PrimaryButton>
            </View>
          )}
        ></FlashList>
      </View>
    </PageContainer>
  );
}

const HeaderComponent = (props: {
  setSearchTerm?: (value: string) => void;
}) => {
  const temp = useRef("");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (props?.setSearchTerm) {
      props.setSearchTerm(searchTerm);
    }
  }, [searchTerm]);
  return (
    <View style={tw`flex flex-row items-center gap-2 mb-4`}>
      <View style={tw`flex-1`}>
        {/*<BaseText>{accountType}</BaseText>*/}
        <InputText
          onChangeText={(e) => {
            temp.current = e;
          }}
          icon={icons.search}
          defaultValue={searchTerm}
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
          setSearchTerm(temp.current);
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
          setSearchTerm("");
        }}
      >
        <Feather name="x" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};
