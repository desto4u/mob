import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import BaseText from "../../components/BaseText";
import PageContainer from "../../components/PageContainer";
import Header from "../../components/texts/header";
import BackButton from "../../components/BackButton";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "../../lib/tailwind";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { newApi } from "../../state/newStates/flow";
import MaterialErrorComponent from "../../components/errors/ErrorComp";
import PageLoader from "../../components/Loader";
import { FlashList } from "@shopify/flash-list";
import { useGetUserQuery } from "../../state/features/services/users/user";
import { memo, useRef, useState } from "react";
import PrimaryButton from "../../components/buttons/PrimaryButtom";
import InputText from "../../components/inputs/InputText";
import InputTextWithLabel from "../../components/inputs/InputWithLabel";
import icons from "../../utils/constants/icons";
import { useTokenStore } from "../../state/newStates/auth";
import IndWalletBalance from "./IndWalletBalance";
import OrgWalletBalance, { New_Transaction } from "./OrgWalletBalance";
interface Transaction {
  id: number;
  individualId: string;
  organizationId: string;
  subscriptionId: number;
  plan: {
    id: number;
    name: string;
    price: string;
    validity: number;
    description: string;
  };
  amount: string;
  paystackResponse: {
    amount: number;
    paidAt: string;
    status: string;
    channel: string;
    currency: string;
    customer: string;
    reference: string;
  };
  status: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  individual: {
    isVerified: boolean;
    id: string;
    mobiHolderId: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerifiedAt: string;
    username: string;
    phoneNumber: string;
    dateOfBirth: null;
    companyName: null;
    companyAddress: null;
    companyEmail: null;
    aboutCompany: null;
    natureOfOrganization: null;
    isSuperAdmin: boolean;
    accountType: string;
    acceptedTnC: boolean;
    photo: null;
    wallet: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}
const dummyTransactions = [
  // ... (dummyTransactions array remains the same)
];

export interface TRANSACTTION_API_RESPONSE {
  code: number;
  message: string;
  data: any[];
}
export default function WalletBalance() {
  let nav = useNavigation();
  const acct = useTokenStore((state) => state.userObject?.data.accountType);
  // if (acct?.toLowerCase() == "individual") {
  //   return <IndWalletBalance />;
  // }
  return <OrgWalletBalance />;
  const limit = 10;

  return (
    <PageContainer padding={0}>
      <View style={tw`p-4 px-0 flex-1`}></View>
    </PageContainer>
  );
}

export const TransactionItem = ({
  transaction,
}: {
  transaction: New_Transaction;
}) => {
  const { amount, createdAt, status, paystackResponse, reference } =
    transaction;
  const isSuccessful = status?.toLowerCase() === "successful";

  return (
    <View
      style={tw`bg-white dark:bg-[#121212] rounded-3xl p-6 mb-4 shadow-lg border-0`}
    >
      <TouchableOpacity
        onPress={() => {
          return null;
          // console.log(transaction);
        }}
      >
        {/* Header Section with elevated card feeling */}
        <View style={tw`flex-row justify-between items-start mb-4`}>
          <View style={tw`flex-1`}>
            {/* Amount with better typography hierarchy */}
            <BaseText
              style={tw`text-2xl font-bold text-gray-900 dark:text-white mb-1`}
            >
              ₦{amount?.toLocaleString()}
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
              <View
                style={tw`bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full`}
              >
                {/*<View style={tw``}></View>*/}
                <BaseText
                  style={tw`text-xs font-medium text-blue-600 dark:text-blue-400 capitalize`}
                >
                  {paystackResponse?.channel}
                </BaseText>
              </View>
            </View>
          </View>

          {/* Status icon with material elevation */}
          {/*<View
            style={tw`${isSuccessful ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"} p-3 rounded-full shadow-sm`}
          >
            <MaterialIcons
              name={isSuccessful ? "check-circle" : "error"}
              size={28}
              color={isSuccessful ? "#10B981" : "#EF4444"}
            />
          </View>*/}
        </View>

        {/* Divider */}
        <View style={tw`h-px bg-gray-200 dark:bg-gray-700 mb-4`} />

        {/* Customer Information Section */}
        <View style={tw`mb-2`}>
          <BaseText
            style={tw`text-lg  font-bold text-gray-500 opacity-60 dark:text-gray-400 uppercase tracking-wide mb-2`}
          >
            User Details
          </BaseText>
          <View style={tw`bg-gray-50 dark:bg-gray-800/50  rounded-2xl`}>
            {paystackResponse?.customer && (
              <View style={tw`mb-2`}>
                <BaseText
                  style={tw`text-sm font-medium text-gray-900 dark:text-white`}
                >
                  {paystackResponse.customer}
                </BaseText>
              </View>
            )}
            {paystackResponse?.currency && (
              <View style={tw`flex-row items-center`}>
                <BaseText
                  style={tw`text-xs text-gray-600 dark:text-gray-300 mr-2`}
                >
                  Currency:
                </BaseText>
                <BaseText
                  style={tw`text-xs font-medium text-gray-700 dark:text-gray-200 uppercase`}
                >
                  {paystackResponse.currency}
                </BaseText>
              </View>
            )}
            {paystackResponse?.paidAt && (
              <View style={tw`flex-row items-center mt-1`}>
                <BaseText
                  style={tw`text-xs text-gray-600 dark:text-gray-300 mr-2`}
                >
                  Paid at:
                </BaseText>
                <BaseText
                  style={tw`text-xs font-medium text-gray-700 dark:text-gray-200`}
                >
                  {new Date(paystackResponse.paidAt).toLocaleString()}
                </BaseText>
              </View>
            )}
          </View>
        </View>

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
              {reference}
            </BaseText>
          </View>

          {/* Status Badge */}
          <View
            style={tw`${isSuccessful ? "bg-emerald-100 dark:bg-emerald-900" : "bg-red-100 dark:bg-red-900/50"} px-3 py-2 rounded-xl`}
          >
            <BaseText
              style={tw`text-xs font-bold ${isSuccessful ? "text-emerald-800  dark:text-emerald-200" : "text-red-800 dark:text-red-200"} uppercase tracking-wide`}
            >
              {/*{JSON.stringify(isSuccessful)}*/}
              {status}
            </BaseText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const GoToSubscriptions = () => {
  const nav = useNavigation();
  return (
    <View style={tw`ml-auto`}>
      <TouchableOpacity
        style={tw`bg-primary p-2 rounded-full`}
        //@ts-ignore*
        onPress={() => nav.navigate("SubscriptionBalance")}
      >
        <BaseText style={tw`  text-white text-sm`}>Subscriptions</BaseText>
      </TouchableOpacity>
    </View>
  );
};

export const GoToOrgSubscriptions = () => {
  const nav = useNavigation();
  return (
    <View style={tw`ml-auto`}>
      <TouchableOpacity
        style={tw`bg-primary p-2 rounded-full`}
        //@ts-ignore*
        onPress={() => nav.navigate("OrgSubscriptionBalance")}
      >
        <BaseText style={tw`  text-white text-sm`}>Subscriptions</BaseText>
      </TouchableOpacity>
    </View>
  );
};
