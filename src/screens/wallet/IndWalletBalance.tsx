import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { newApi } from "../../state/newStates/flow";
import PageContainer from "../../components/PageContainer";
import {
  GoToSubscriptions,
  TransactionItem,
  TRANSACTTION_API_RESPONSE,
} from "./WalletBalance";
import Header from "../../components/texts/header";
import BackButton from "../../components/BackButton";
import tw from "../../lib/tailwind";
import { useNavigation } from "@react-navigation/native";
import MaterialErrorComponent from "../../components/errors/ErrorComp";
import { FlashList } from "@shopify/flash-list";
import BaseText from "../../components/BaseText";
import PrimaryButton from "../../components/buttons/PrimaryButtom";
import { useState } from "react";

export default function IndWalletBalance() {
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const query = useQuery<TRANSACTTION_API_RESPONSE>({
    queryKey: ["transcations_ind"],
    queryFn: async () => {
      let resp = await newApi.get(
        "/api/memberships-subscriptions/get/individual/transactions?page=1&limit=10&sortBy=createdAt&order=desc",
      );
      return resp.data;
    },
  });

  if (query.isError) {
    return (
      <PageContainer>
        <View style={tw` flex flex-row border-b border-neutral-500/20 pb-4  `}>
          <BackButton onPress={(e) => nav.goBack()} />
          <Header style={tw`mx-auto`}>Transaction History</Header>
          {/*<GoToSubscriptions />*/}
          {/*<BaseText>Subscriptions</BaseText>*/}
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
        style={tw`  pb-2 flex flex-row items-center border-b border-neutral-500/20 pb-4  `}
      >
        <BackButton onPress={(e: any) => nav.goBack()} />
        <Header style={tw`mx-auto`}>Transaction History</Header>
        <GoToSubscriptions />
        {/* Balance Card */}
      </View>
      <View style={tw`flex-1 `}>
        <FlashList
          contentContainerStyle={tw`p-2 pt-4`}
          onRefresh={query.refetch}
          refreshing={query.isFetching}
          ListEmptyComponent={() => {
            return (
              <View
                style={tw`flex-1 min-h-[500px] flex items-center justify-center`}
              >
                <BaseText style={tw`text-center text-xl font-bold opacity-80`}>
                  No transactions found
                </BaseText>
                <BaseText
                  style={tw`text-center mt-4 bg-primary/20  p-4 rounded-full font-bold opacity-80`}
                >
                  Pull Down to refresh
                </BaseText>
              </View>
            );
          }}
          data={query.data?.data || []}
          renderItem={({ index, item }) => {
            return <TransactionItem transaction={item} key={item.id} />;
          }}
          ListFooterComponent={(prop) => (
            <View
              style={tw`py-6 flex flex-row items-center justify-center gap-4`}
            >
              {/*<BaseText>{JSON.stringify(prop)}</BaseText>*/}
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
        />
      </View>
    </PageContainer>
  );
}
