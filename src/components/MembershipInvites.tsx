import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import TextPrimary from "./texts/text";
import { colors } from "../utils/constants";
import tw from "../lib/tailwind";
import InputText from "./inputs/InputText";
import icons from "../utils/constants/icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MembershipRequestItem from "./MembershipRequestItem";
import MembershipInviteItem from "./MembershipInviteItem";
import {
  useDeleteMemberInviteMutation,
  useGetUserOrganizationMembershipQuery,
} from "../state/features/services/membership/membership";
import BottomModals from "./modals/BottomModals";
import PrimaryButton from "./buttons/PrimaryButtom";
import Toast from "react-native-toast-message";
import images from "../utils/constants/images";
import SimpleLoader from "./SimpleLoader";
import { useMutation } from "@tanstack/react-query";
import { newApi } from "../state/newStates/flow";
import { AxiosError } from "axios";

const MembershipInvites = ({}) => {
  const [deleteMemberInvite, { isLoading: isDeletting }] =
    useDeleteMemberInviteMutation();
  const {
    data: pendingInvite,
    isLoading: isGettingPending,
    refetch: refetchInvite,
    isFetching,
  } = useGetUserOrganizationMembershipQuery("pendingFromOrganization");
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [selected_item, setSelected_item] = useState<any>({});

  if (isGettingPending) return <SimpleLoader />;
  const toggleModal = (item: any, fullItem: any) => {
    setModal(!modal);
    setSelected(item);
    setSelected_item(fullItem);
  };

  const closeModal = () => {
    setModal(false);
  };
  let delete_mutation = useMutation({
    mutationFn: async () => {
      let resp = await newApi.delete(
        "/api/memberships-subscriptions/organization/membership/pending/delete?requestId" +
          selected.id,
        {
          params: {
            membershipId: selected_item.id.toString(),
            status: "declined", // declined, inactive or active
            memberId: selected_item.memberId,
            organizationEmail: selected_item.organizationEmail, // Not Required
          },
        },
      );
      return resp.data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Membership deleted successfully",
      });
      closeModal();
    },
    onError: (error: AxiosError) => {
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "An error occured",
      });
    },
  });

  const handleSubmit = async () => {
    // return console.log(selected_item);
    delete_mutation.mutate();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchInvite();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={tw`flex-1 px-[5%]  `}>
      <FlatList
        data={pendingInvite?.data}
        renderItem={({ item }) => (
          <View style={tw`my-3`}>
            <MembershipInviteItem
              item={item.individual}
              fullItem={item}
              designation={item?.designation}
              membershipId={item.id}
              toggleModal={toggleModal}
            />
          </View>
        )}
        style={tw`mt-5 `}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={
          <View>
            <TextPrimary size={13} font="medium" style={tw` text-gray_light`}>
              All your sent membership invites
            </TextPrimary>
          </View>
        }
      />
      <BottomModals open={modal} handleClose={closeModal} snapPoints={["50"]}>
        <View style={tw`p-5 pt-0`}>
          {/* <View style={tw`h-[2px] w-[80px] rounded-sm bg-[#606060] mx-auto`} /> */}
          <TextPrimary font="medium" size={15} style={tw`text-center mt-5`}>
            Do you want to cancel Invite ?
          </TextPrimary>
          <View style={tw`gap-5 mt-6`}>
            <View style={tw`flex-col gap-2 items-center`}>
              <Image
                source={
                  selected?.photo ? { uri: selected.photo } : images.profileImg
                }
                resizeMode="cover"
                style={tw`h-[66px] w-[66px] rounded-full`}
              />
              <View style={tw`gap-1 items-center`}>
                <TextPrimary font="semi_bold" size={14}>
                  {`${selected?.firstName} ${selected?.lastName}`}
                </TextPrimary>

                <TextPrimary font="semi_bold" size={11} color="#696767">
                  {selected.email}
                </TextPrimary>
              </View>
            </View>

            <PrimaryButton
              size={13}
              style={tw``}
              loading={delete_mutation.isPending}
              onPress={handleSubmit}
              color="#F74D1B"
            >
              Cancel this Invite
            </PrimaryButton>
          </View>
        </View>
      </BottomModals>
    </View>
  );
};

export default MembershipInvites;

const styles = StyleSheet.create({});
