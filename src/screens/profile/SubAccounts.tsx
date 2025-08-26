import { View, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import PageContainer from "../../components/PageContainer";
import BackButton from "../../components/BackButton";
import Header from "../../components/texts/header";
import tw from "../../lib/tailwind";
import BaseText from "../../components/BaseText";
import { useQuery } from "@tanstack/react-query";
import { newApi } from "../../state/newStates/flow";
import PageLoader from "../../components/Loader";
import MaterialErrorComponent from "../../components/errors/ErrorComp";
import { useColorScheme } from "nativewind";
import { colors } from "../../utils/constants";

interface APIResponse {
  code: number;
  message: string;
  data: SubAccount[];
}
interface SubAccount {
  accountNumber: string;
  active: boolean;
  businessName: string;
  createdAt: string;
  id: string;
  percentageCharge: number;
  settlementBank: string;
  subaccountCode: string;
  updatedAt: string;
  userId: string;
}
const AccountCard = ({ account }: { account: SubAccount; colorScheme }) => (
  <TouchableOpacity
    style={[
      tw`mx-3 my-1 rounded-md p-2 shadow-xl bg-white dark:bg-gray-800 m-4`,
      tw`bg-[#fff] dark:bg-[${colors.dark}]`,
    ]}
    activeOpacity={0.8}
    onPress={() => {
      console.log(account);
    }}
  >
    <View style={tw`p-3`}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-1`}>
          <BaseText style={tw`text-sm font-bold`}>Account Name:</BaseText>
          <BaseText
            style={tw`text-xl font-medium text-gray-900`}
            numberOfLines={1}
          >
            {account.businessName}
          </BaseText>
        </View>
        <View
          style={tw`w-6 h-6 rounded-full ${
            account.active ? "bg-green-600" : "bg-gray-400"
          } items-center justify-center ml-2`}
        >
          <BaseText style={tw`text-white text-xs`}>
            {account.active ? "✓" : "!"}
          </BaseText>
        </View>
      </View>

      <View style={tw`mt-3 border-t border-gray-100 pt-3`}>
        <View>
          <BaseText style={tw`text-xs text-gray-500 font-medium`}>
            Bank Name
          </BaseText>
          <BaseText style={tw`text-sm text-gray-900 mt-1`}>
            {account.settlementBank}
          </BaseText>
        </View>

        <View style={tw`mt-3`}>
          <BaseText style={tw`text-xs text-gray-500 font-medium`}>
            Account Number
          </BaseText>
          <BaseText style={tw`text-sm font-mono text-gray-900 mt-1`}>
            {account.accountNumber}
          </BaseText>
        </View>

        <View style={tw`flex-row justify-between mt-3`}>
          <View>
            <BaseText style={tw`text-xs text-gray-500 font-medium`}>
              Code
            </BaseText>
            <BaseText style={tw`text-xs font-mono text-gray-900 mt-1`}>
              {account.subaccountCode}
            </BaseText>
          </View>
          <View>
            <BaseText style={tw`text-xs text-gray-500 font-medium`}>
              Rate
            </BaseText>
            <BaseText style={tw`text-xs text-gray-900 mt-1`}>
              {account.percentageCharge}%
            </BaseText>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function SubAccounts() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const subs = useQuery<APIResponse>({
    queryKey: ["subAccount"],
    queryFn: async () => {
      let response = await newApi.get("/api/users/payment/subaccounts");
      return response.data;
    },
  });

  if (subs.isFetching) return <PageLoader />;
  if (subs.isError)
    return (
      <PageContainer>
        <MaterialErrorComponent onRetry={subs.refetch} showRetryButton={true} />
      </PageContainer>
    );

  const renderItem = ({ item }: { item: SubAccount }) => (
    <AccountCard account={item} colorScheme={colorScheme} />
  );

  const renderEmpty = () => (
    <View style={tw`flex-1 justify-center items-center px-8 py-12`}>
      <View
        style={tw`w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6`}
      >
        <BaseText style={tw`text-gray-400 text-3xl`}>💳</BaseText>
      </View>
      <BaseText style={tw`text-lg font-medium text-gray-700 mb-2 text-center`}>
        No Saved Accounts
      </BaseText>
      <BaseText style={tw`text-gray-500 text-center leading-6`}>
        You haven't saved any bank accounts yet. Add an account to get started.
      </BaseText>
    </View>
  );

  return (
    <PageContainer padding={0}>
      <View style={tw`flex-1 `}>
        {/* Material Design App Bar */}
        <View style={tw` shadow-sm elevation-2`}>
          <View
            style={tw`flex-row px-4 items-center py-4 border-b border-gray-100`}
          >
            <BackButton />
            <BaseText style={tw`text-xl font-semibold text-gray-900 mx-auto`}>
              Saved Accounts
            </BaseText>
          </View>
        </View>

        {/* Accounts List */}
        <View style={tw`flex-1 pt-4`}>
          {subs.data?.data.length === 0 ? (
            renderEmpty()
          ) : (
            <FlashList
              data={subs.data?.data || []}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              estimatedItemSize={180}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-6`}
            />
          )}
        </View>
      </View>
    </PageContainer>
  );
}
