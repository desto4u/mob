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
import { FlashList } from "@shopify/flash-list";

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
      <TextPrimary color={colors.gray_light} font="medium">
        Tickets
      </TextPrimary>

      <View style={tw`flex-1 `}>
        {/*<BaseText>{JSON.stringify(eventDetails.eventtickets)}</BaseText>*/}
        {isArray && (
          <FlashList
            ListHeaderComponent={() => {
              return (
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
                    <Checkbox
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    <TextPrimary size={11}>
                      Mark event as FREE for user
                    </TextPrimary>
                  </View>
                  <PrimaryButton loading={isLoading} onPress={handleSubmit}>
                    Invite Users(s)
                  </PrimaryButton>
                </View>
              );
            }}
            estimatedItemSize={200}
            data={event_details?.eventtickets}
            contentContainerStyle={tw`p-2`}
            renderItem={({ item }) => {
              // --- Redesigned Ticket Card ---
              const isSelected = selectedTickets?.id === item.id;
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (isSelected) {
                      return setSelectedTickets(null);
                    }
                    setSelectedTickets(item);
                  }}
                  style={[tw`mb-4`]}
                  activeOpacity={0.92}
                >
                  <View
                    style={[
                      tw` rounded-xl border `,
                      {
                        borderColor: isSelected ? colors.primary : "#E5E7EB",
                        // elevation: isSelected ? 4 : 2,
                        // shadowColor: "#000",
                        // shadowOffset: { width: 0, height: 2 },
                        // shadowOpacity: 0.12,
                        // shadowRadius: 4,
                      },
                    ]}
                  >
                    {/* Decorative top edge */}
                    <View
                      style={tw`flex-row justify-between items-center px-5 pt-4`}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View
                          style={tw`w-3 h-3 rounded-full bg-gray-200 mr-2`}
                        />
                        <BaseText font="bold" size={18} color={colors.primary}>
                          {item.name}
                        </BaseText>
                      </View>
                      {isSelected && (
                        <View
                          style={tw`bg-[${colors.primary}] px-2 py-1 rounded-full`}
                        >
                          <BaseText size={12} style={tw`text-white`}>
                            Selected
                          </BaseText>
                        </View>
                      )}
                    </View>
                    {/* Divider with dashed line and notches */}
                    <View style={tw`flex-row items-center mt-3 mb-2 px-5`}>
                      <View style={tw`w-2 h-2 rounded-full bg-gray-200`} />
                      <View
                        style={tw`flex-1 border-t border-dashed border-gray-300 mx-2`}
                      />
                      <View style={tw`w-2 h-2 rounded-full bg-gray-200`} />
                    </View>
                    {/* Ticket details */}
                    <View style={tw`px-5 pb-4`}>
                      <View
                        style={tw`flex-row justify-between items-center mb-2`}
                      >
                        <BaseText size={15} color={colors.gray_light}>
                          Price
                        </BaseText>
                        <BaseText
                          font="bold"
                          size={16}
                          color={
                            item.price == 0 ? colors.primary : colors.gray_dark
                          }
                        >
                          {item.price == 0 || item.price === null
                            ? "Free"
                            : `$${item.price}`}
                        </BaseText>
                      </View>
                      <View
                        style={tw`flex-row justify-between items-center mb-2`}
                      >
                        <BaseText size={15} color={colors.gray_light}>
                          Tickets Available
                        </BaseText>
                        <BaseText size={15} color={colors.gray}>
                          {item.ticketsAvailable}
                        </BaseText>
                      </View>
                      {/* Add more details if needed */}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            extraData={selectedTickets}
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
