import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import TextPrimary from "../texts/text";
import InvitedEventItem from "./InvitedEventItem";
import images from "../../utils/constants/images";
import tw from "twrnc";
import { colors } from "../../utils/constants";
import InvitationItem from "./InvitationItem";
import SearchInput from "../inputs/Search";
import Checkbox from "../inputs/Checkbox";
import PrimaryButton from "../buttons/PrimaryButtom";
import {
  useGetSentInvitationQuery,
  useGetSingleEventPublicQuery,
  useSetEventInvitationMutation,
} from "../../state/features/services/events/events";
import Toast from "react-native-toast-message";
import InputTextWithLabel from "../inputs/InputWithLabel";
import PageLoader from "../Loader";
import SimpleLoader from "../SimpleLoader";
import { newApi } from "../../state/newStates/flow";
import PageContainer from "../PageContainer";
import BaseText from "../BaseText";

interface Venue {
  name: string;
  address: string;
}

interface EventTicket {
  id: number;
  name: string;
  ticketsAvailable: number;
  price: number | null;
}

interface EventData {
  id: number;
  userId: string;
  eventId: string;
  name: string;
  description: string;
  category: null;
  accessType: string;
  image: null;
  venue: Venue;
  venueImage: any[];
  startDate: string;
  endDate: string;
  ticketType: string;
  allowVerifierRequests: boolean;
  isRecurring: boolean;
  frequency: null;
  recurrenceEndType: null;
  recurrenceEndDate: null;
  recurrenceCount: null;
  status: string;
  createdAt: string;
  updatedAt: string;
  eventtickets: EventTicket[];
}

interface EventApiResponse {
  code: number;
  message: string;
  data: EventData;
}
const InvitationListing = ({ navigation, eventId }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };
  const {
    data,
    isLoading: isLoadingData,
  }: { data: EventApiResponse | undefined; [key: string]: any } =
    useGetSingleEventPublicQuery(eventId);
  const {
    data: inviteData,
    refetch,
    isFetching,
    isLoading: isGettingInvites,
  } = useGetSentInvitationQuery(eventId);
  const [sendInvite, { isLoading }] = useSetEventInvitationMutation();

  const inviteList = inviteData?.data;

  if (isLoadingData || isGettingInvites) return <SimpleLoader />;
  const eventDetails = data?.data;

  // console.log(eventDetails?.eventtickets);

  const handleSubmit = async () => {
    // return;
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email fields are required",
      });
      return;
    }
    if (!eventDetails?.eventtickets) {
      Alert.alert("error", "This event doesn't have a ticket");
      return;
    }

    // const tickets = eventDetails.eventtickets;
    let tik_id = eventDetails?.eventtickets?.id
      ? eventDetails?.eventtickets?.id.toString()
      : eventDetails.eventtickets[0].id.toString();
    // return console.log(tik_id);
    //
    // return console.log(tik_id);

    const payload = {
      eventId: eventId.toString(),
      userId: email,
      isFree: true,
      ticketId: tik_id,
    };
    // return console.log(payload);
    try {
      const response = await newApi.post("/api/events/send/invitation", {
        ...payload,
      });

      // Toast.show({
      //   type: "success",
      //   text1: "ss",
      // });

      if (response?.error) {
        Alert.alert("error", response?.error?.data?.message);
        return;
      }

      Toast.show({
        type: "success",
        text1: response?.data?.message,
      });
      navigation.goBack();
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
  // console.log(JSON.stringify(data));
  if (isFetching) return <PageLoader />;
  // return <></>
  const event_details = data?.data;
  const isArray = Array.isArray(event_details?.eventtickets);
  // return (
  //   <View style={tw`bg-red-200 pb-12`}>
  //     <ScrollView style={tw``}>
  //       <BaseText>{JSON.stringify(eventDetails)}</BaseText>
  //     </ScrollView>
  //   </View>
  // );
  return (
    <View style={tw`px-[5%]`}>
      <View
        style={tw`gap-4 border border-dashed border-[#2E2F36] mb-6 p-4 rounded-[10px]`}
      >
        <TextPrimary color={colors.gray_light} font="medium">
          Invite User
        </TextPrimary>
        <InputTextWithLabel
          placeholder="Enter user email or ID"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <View style={tw`flex-row items-center gap-2`}>
          <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
          <TextPrimary size={11}>Mark event as FREE for user</TextPrimary>
        </View>
        <PrimaryButton loading={isLoading} onPress={handleSubmit}>
          Invite Users(s)
        </PrimaryButton>
      </View>
      <TextPrimary color={colors.gray_light} font="medium">
        Previously Invited
      </TextPrimary>

      {isArray && (
        <FlatList
          data={event_details?.eventtickets}
          renderItem={({ item }) => {
            <>
              <BaseText>{JSON.stringify(item)}</BaseText>
            </>;
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={onRefresh}
            />
          }
          style={tw``}
        />
      )}
    </View>
  );
};

export default InvitationListing;

const styles = StyleSheet.create({});
