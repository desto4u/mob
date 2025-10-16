import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import PageContainer from "../../components/PageContainer";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import tw from "twrnc";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Header from "../../components/texts/header";
import AntDesign from "@expo/vector-icons/AntDesign";
import { colors } from "../../utils/constants/colors";
import icons from "../../utils/constants/icons";
import TextPrimary from "../../components/texts/text";
import ListItem from "../../components/ListItem";
import BackButton from "../../components/BackButton";
import {
  useDeleteIndividualIdCardMutation,
  useGetPersonalCardDetailsQuery,
} from "../../state/features/services/card/card";
import PageLoader from "../../components/Loader";
import { formatDate } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomModals from "../../components/modals/BottomModals";
import PrimaryButton from "../../components/buttons/PrimaryButtom";
import Toast from "react-native-toast-message";
import { newApi } from "../../state/newStates/flow";
import BaseText from "../../components/BaseText";

const ViewPersonalCardDetails = ({ navigation, route }: any) => {
  const cardId = route?.params?.cardId;

  const insets = useSafeAreaInsets();
  const [dropdown, setDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  const { data, isLoading, refetch, isFetching } =
    useGetPersonalCardDetailsQuery(cardId);

  const [deleteCard, { isLoading: isDeleting }] =
    useDeleteIndividualIdCardMutation();

  const cardDetails = data?.data;

  const handleSubmit = async () => {
    try {
      const response = await newApi.delete(
        "/api/idcards/personal/cards?id=" + cardId,
      );

      // if (response?.error) {
      //   return Toast.show({
      //     type: "error",
      //     text1: response?.error?.data?.message,
      //   });
      // }
      Toast.show({
        type: "success",
        text1: response?.data?.message,
      });
      navigation.goBack();
      // navigation.navigate("RequestSuccess")
    } catch (error: any) {
      console.log(error);

      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "An error occurred",
      });
    }
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
  if (isLoading) return <PageLoader />;
  return (
    <>
      <PageContainer>
        <ScrollView
          style={tw`flex-1`} // Added flex-1 for better layout
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={onRefresh}
              tintColor={colors.primary} // Added tint color for refresh indicator
            />
          }
        >
          <View style={tw`flex-row justify-between items-center relative z-10`}>
            <BackButton onPress={() => navigation.goBack()} />
            <Header font="semi_bold" size={18} style={tw`text-white`}>
              View Card
            </Header>

            <Pressable
              onPress={() => setDropdown(!dropdown)}
              style={tw`p-2`} // Added padding for easier press
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="#C4C4C4"
              />
            </Pressable>
            {dropdown && (
              <View
                style={tw`bg-[#3A3A3C] rounded-[10px] p-3 gap-3 w-[181px] absolute right-4 top-12 z-[999999] shadow-lg`} // Adjusted position and added shadow
              >
                <Pressable
                  onPress={() => {
                    navigation.navigate("AddCard", { cardId });
                    setDropdown(false); // Close dropdown after selection
                  }}
                  style={tw`py-2 `}
                >
                  <TextPrimary
                    size={13}
                    font="medium"
                    style={tw`text-[#EEEEEE]`}
                  >
                    Edit Card
                  </TextPrimary>
                </Pressable>
                <Pressable
                  onPress={() => {
                    openModal();
                    setDropdown(false);
                  }}
                  style={tw`py-2 `}
                >
                  <TextPrimary
                    size={13}
                    font="medium"
                    style={tw`text-[#EEEEEE]`}
                  >
                    Delete Card
                  </TextPrimary>
                </Pressable>
              </View>
            )}
          </View>
          <TextPrimary
            size={18}
            font="semi_bold"
            color={colors.gray_light}
            style={tw`mt-2 px-4`} // Increased font size and added horizontal padding
          >
            <BaseText style={tw`text-xl font-bold capitalize`}>
              {cardDetails?.issuingOrganization}
            </BaseText>
          </TextPrimary>

          <View style={tw`mt-8 items-center`}>
            {cardDetails?.scanIDCard.frontIdCard && (
              <Image
                source={{ uri: cardDetails?.scanIDCard.frontIdCard }}
                resizeMode="cover" // Changed to cover for better image display
                style={tw`w-[90%] h-[200px] rounded-lg shadow-md`} // Added rounded corners and shadow
              />
            )}
            {cardDetails?.scanIDCard.backIdCard && (
              <Image
                source={{ uri: cardDetails?.scanIDCard.backIdCard }}
                resizeMode="cover" // Changed to cover
                style={tw`w-[90%] h-[200px] mt-4 rounded-lg shadow-md`} // Added rounded corners and shadow
              />
            )}
          </View>

          <View style={tw`mt-8 pb-10 px-4`}>
            <View style={tw`mt-2 gap-4`}>
              <ListItem
                icon={icons.card_number}
                itemKey="ID Card Number"
                value={cardDetails.cardNumber}
              />
              <ListItem
                icon={icons.company}
                itemKey="Issuing Organization"
                value={cardDetails?.issuingOrganization}
              />
              <ListItem
                icon={icons.role}
                itemKey="Role"
                value={cardDetails?.designation}
              />
              <ListItem
                icon={icons.event}
                itemKey="Date Issued"
                value={formatDate(cardDetails?.issuedDate)}
              />
              <ListItem
                icon={icons.event}
                itemKey="Expiry Date"
                value={
                  cardDetails?.expiryDate
                    ? formatDate(cardDetails?.expiryDate)
                    : "No Expiry Date"
                }
              />
              <ListItem
                icon={icons.verify}
                valueColor={
                  cardDetails?.expiryDate
                    ? new Date(cardDetails?.expiryDate) > new Date()
                      ? "#4CD964"
                      : "#F74D1B"
                    : "#4CD964"
                }
                itemKey="Status"
                value={
                  cardDetails?.expiryDate
                    ? new Date(cardDetails?.expiryDate) > new Date()
                      ? "Active"
                      : "Expired"
                    : "Active"
                }
              />
            </View>
          </View>
        </ScrollView>
      </PageContainer>
      <BottomModals open={modal} handleClose={closeModal} snapPoints={["40%"]}>
        {" "}
        {/* Adjusted snapPoints for a smaller modal */}
        <View style={tw`p-6 items-center`}>
          {" "}
          {/* Increased padding and centered content */}
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color="#F74D1B"
            style={tw`mb-4`}
          />
          <TextPrimary font="semi_bold" size={18} style={tw`text-center mb-2`}>
            Delete Card?
          </TextPrimary>
          <TextPrimary
            font="regular"
            size={14}
            style={tw`text-center text-gray-400 mb-6`}
          >
            Are you sure you want to delete this card? This action cannot be
            reversed.
          </TextPrimary>
          <View style={tw`flex-row w-full gap-3`}>
            <PrimaryButton
              size={14}
              style={tw`flex-1 bg-gray-600`} // Styled as a secondary button
              onPress={closeModal}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              size={14}
              style={tw`flex-1`}
              loading={isDeleting}
              onPress={handleSubmit}
              color="#F74D1B"
            >
              Delete
            </PrimaryButton>
          </View>
        </View>
      </BottomModals>
    </>
  );
};

export default ViewPersonalCardDetails;

const styles = StyleSheet.create({});
