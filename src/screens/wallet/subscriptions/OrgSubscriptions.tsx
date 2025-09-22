import { useQuery } from "@tanstack/react-query";
import BaseText from "../../../components/BaseText";
import PageContainer from "../../../components/PageContainer";
import { newApi } from "../../../state/newStates/flow";
import { View } from "react-native";
import tw from "../../../lib/tailwind";
import { FlashList } from "@shopify/flash-list";
import PrimaryButton from "../../../components/buttons/PrimaryButtom";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import BackButton from "../../../components/BackButton";
import Header from "../../../components/texts/header";
import MaterialErrorComponent from "../../../components/errors/ErrorComp";
interface Plan {
  id: string;
  name: string;
  price: string;
  validity: number;
  description: string;
}

interface Transaction {
  id: string;
  accountType: string;
  userId: string;
  subscriptionPlanId: string;
  planId: string;
  refId: string;
  amount: string;
  currency: string;
  gateway: string;
  createdAt: string;
  updatedAt: string;
  // Assuming paystackResponse might be nested in the actual API response for a transaction
  // If it's not, this should be removed. Based on the prompt's data structure, it seems
  // paystack-specific details like channel are not directly on the transaction object.
  // However, the rendering component `SubLogItem` expects `paystackResponse`.
  // For now, let's add it as optional or consider where it truly comes from.
  // If `paystackResponse` is indeed intended to be part of `Transaction`, its structure
  // needs to be defined. Given the diagnostic error, and the sample data,
  // it's likely `PaystackResponse` was a placeholder and not directly mapped.
  // The prompt's sample data does not include a `paystackResponse` object.
  // The `SubLogItem` component uses `paystackResponse.currency` and `paystackResponse.channel`.
  // If this data comes from elsewhere, like a separate call or nested within a different field,
  // it needs to be handled. For now, let's add a placeholder for currency and channel directly
  // to Transaction if that's where it's expected.
  // Based on the prompt's sample data, `currency` is directly on `Transaction`.
  // `channel` is not provided in the sample data.
  // The `SubLogItem` component needs to be adjusted if `paystackResponse` is not available.
  // For now, let's remove the unused `PaystackResponse` interface and adjust `SubLogItem`
  // or assume `paystackResponse` is fetched differently.
  // Since the prompt asks only to rewrite the section with tags, and `PaystackResponse` is
  // declared but unused, the most direct change is to remove it.
  // If `SubLogItem` needs `paystackResponse.channel`, then `Transaction` needs to be
  // updated to include it, or `SubLogItem` needs to be refactored.
  // Let's assume for now that `channel` is not directly available on `Transaction` from this API.
  // The diagnostic error points to `PaystackResponse` being unused.
}

interface Subscription {
  id: number;
  individualId: string;
  organizationId: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

interface SUBSCRIPTION_RESPONSE {
  code: number;
  message: string;
  data: Transaction[]; // Updated to reflect the sample data where 'data' is an array of transactions, not subscriptions
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export default function OrgSubscriptionBalance() {
  const nav = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const query = useQuery<SUBSCRIPTION_RESPONSE>({
    queryKey: ["individual_subscription_payments"],
    queryFn: async () => {
      let resp = await newApi.get(
        "/api/users/organization/subscription-payments",
        {
          params: { page: currentPage },
        },
      );
      return resp.data;
    },
  });

  useEffect(() => {
    console.log(query.error, "error fetching");
  }, [query.isError]);
  if (query.isError) {
    return (
      <PageContainer>
        <View
          style={tw`  pb-2 flex flex-row items-center border-b border-neutral-500/20 pb-4  `}
        >
          <BackButton onPress={(e: any) => nav.goBack()} />
          <Header style={tw`mx-auto  font-bold`}>
            <BaseText style={tw`text-lg `}>
              Subscription Payment History
            </BaseText>
          </Header>
          {/*<GoToSubscriptions />*/}
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
  const data = query.data?.data || [];
  console.log(JSON.stringify(data));

  // return (
  //   <PageContainer>
  //     <BaseText>{JSON.stringify(data)}</BaseText>
  //   </PageContainer>
  // );
  return (
    <PageContainer>
      <View
        style={tw`  pb-2 flex flex-row items-center border-b border-neutral-500/20 pb-4  `}
      >
        <BackButton onPress={(e: any) => nav.goBack()} />
        <Header style={tw`mx-auto  font-bold`}>
          <BaseText style={tw`text-lg `}>Subscription Payment History</BaseText>
        </Header>
        {/*<GoToSubscriptions />*/}
        {/* Balance Card */}
      </View>
      {/*<BaseText>logs {JSON.stringify(data)}</BaseText>*/}
      <View style={tw`flex-1`}>
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
            return (
              <View>
                <SubLogItem item={item} />
              </View>
            );
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
const SubLogItem = ({ item }: { item: Transaction }) => {
  const { amount, createdAt, refId, currency } = item;
  const isSuccessful = true;
  const currencySymbol = currency || "$";
  const formattedAmount = parseFloat(amount).toLocaleString();

  return (
    <View
      style={tw`bg-white dark:bg-[#121212] rounded-3xl p-6 mb-4 shadow-lg border-0`}
    >
      {/* Header Section with elevated card feeling */}
      <View style={tw`flex-row justify-between items-start mb-4`}>
        <View style={tw`flex-1`}>
          {/* Amount with better typography hierarchy */}
          <BaseText
            style={tw`text-2xl font-bold text-gray-900 dark:text-white mb-1`}
          >
            {currencySymbol} {formattedAmount}
          </BaseText>

          {/* Date and channel with material chips style */}
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full mr-2`}
            >
              <BaseText
                style={tw`text-xs font-medium text-gray-600 dark:text-gray-300`}
              >
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </BaseText>
            </View>
          </View>
        </View>

        {/* Status icon with material elevation */}
        <View
          style={tw`${isSuccessful ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"} p-3 rounded-full shadow-sm`}
        >
          <BaseText
            style={tw`text-lg font-bold ${isSuccessful ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isSuccessful ? "✓" : "✗"}
          </BaseText>
        </View>
      </View>

      {/* Divider */}
      <View style={tw`h-px bg-gray-200 dark:bg-gray-700 mb-4`} />

      {/* Footer Section */}
      <View
        style={tw`flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800`}
      >
        {/* Reference */}
        <View style={tw`flex-1`}>
          <BaseText
            style={tw`text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1`}
          >
            Reference
          </BaseText>
          <BaseText
            style={tw`text-sm font-mono text-gray-700 dark:text-gray-300`}
          >
            {refId}
          </BaseText>
        </View>

        {/* Status Badge */}
        <View
          style={tw`${isSuccessful ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"} px-3 py-2 rounded-full`}
        >
          <BaseText
            style={tw`text-xs font-bold ${isSuccessful ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"} uppercase tracking-wide`}
          >
            Success
          </BaseText>
        </View>
      </View>
    </View>
  );
};
