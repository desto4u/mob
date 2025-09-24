import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import EventTickets from "./EventTickets";

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
  const [selectedTickets, setSelectedTickets] = useState<null | any>(null);
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
  const event_details = data?.data;

  // console.log(eventDetails?.eventtickets);
  const isArray = Array.isArray(event_details?.eventtickets);

  const handleSubmit = async () => {
    // return console.log(eventDetails, "details");
    const isFree = eventDetails?.ticketType == "Free";

    // return;
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email fields are required",
      });
      return;
    }
    if (isArray && !selectedTickets) {
      Toast.show({ type: "error", text1: "Select a ticket" });
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
    if (selectedTickets) {
      tik_id = selectedTickets?.id?.toString();
    }

    const payload = {
      eventId: eventId.toString(),
      userId: email,
      isFree: isFree ? true : isChecked,
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
  // return (
  //   <View style={tw`bg-red-200 pb-12`}>
  //     <ScrollView style={tw``}>
  //       <BaseText>{JSON.stringify(eventDetails)}</BaseText>
  //     </ScrollView>
  //   </View>
  // );
  return (
    <View style={tw`px-[5%] flex-1`}>
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
        Tickets
      </TextPrimary>

      <View style={tw`flex-1 `}>
        {/*<BaseText>{JSON.stringify(eventDetails.eventtickets)}</BaseText>*/}
        {isArray && (
          <FlatList
            data={event_details?.eventtickets}
            contentContainerStyle={tw`p-2`}
            renderItem={({ item }) => {
              return (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(item);
                      if (selectedTickets?.id === item.id) {
                        return setSelectedTickets(null);
                      }
                      setSelectedTickets(item);
                    }}
                    style={[
                      tw` p-4 rounded-lg border border-gray-200 mb-2 `,
                      {
                        borderColor:
                          selectedTickets?.id === item.id
                            ? colors.primary
                            : colors.gray_light,
                      },
                    ]}
                  >
                    <BaseText font="bold" size={16}>
                      {item.name}
                    </BaseText>
                    <BaseText size={14} color={colors.gray_light}>
                      price: {item.price == 0 ? "Free" : `${item.price}`}
                    </BaseText>
                    <BaseText size={12} color={colors.gray}>
                      Tickets Available: {item.ticketsAvailable}
                    </BaseText>
                  </TouchableOpacity>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isFetching}
                onRefresh={onRefresh}
              />
            }
            style={tw`flex-1`}
          />
        )}
      </View>
    </View>
  );
};

export default InvitationListing;

const styles = StyleSheet.create({});
