import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef } from "react";
import { colors } from "../../utils/constants";
import TextPrimary from "../texts/text";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useColorScheme } from "nativewind";
import SmallButton from "../buttons/SmallButton";
import tw from "../../lib/tailwind";
import images from "../../utils/constants/images";
import ImageComp from "../ImageComp";
import icons from "../../utils/constants/icons";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { newApi } from "../../state/newStates/flow";
import { useMutation } from "@tanstack/react-query";
import { Paystack, paystackProps } from "react-native-paystack-webview";
import { useTokenStore } from "../../state/newStates/auth";
import { useGetPaymentGatewayQuery } from "../../state/features/services/users/user";
import Toast from "react-native-toast-message";
import { AxiosError, AxiosRequestHeaders, AxiosResponseHeaders } from "axios";

// interface ItemProps {
//   item?: any;
//   navigation?: any;
// }
interface EventInvitesItemProps {
  createdAt: string;
  event: {
    accessType: string;
    allowVerifierRequests: boolean;
    category: number;
    createdAt: string;
    description: string;
    endDate: string;
    eventId: string;
    frequency: null | any;
    id: number;
    image: string;
    isRecurring: boolean;
    name: string;
    recurrenceCount: null | any;
    recurrenceEndDate: null | any;
    recurrenceEndType: null | any;
    startDate: string;
    status: string;
    ticketType: string;
    updatedAt: string;
    userId: string;
    venue: {
      address: string;
      name: string;
    };
    venueImage: string[];
  };
  eventId: number;
  eventtickets: {
    createdAt: string;
    eventId: number;
    id: number;
    name: string;
    plusAllowed: number;
    price: string;
    ticketsAvailable: number;
    updatedAt: string;
    userId: string;
  };
  id: number;
  invitationToken: string;
  invitedAt: string;
  invitedBy: string;
  isFree: boolean;
  status: string;
  ticketId: number;
  updatedAt: string;
  user: {
    aboutCompany: string;
    acceptedTnC: boolean;
    accountType: string;
    companyAddress: {
      country: string;
      state: string;
      street: string;
    };
    companyEmail: string;
    companyName: string;
    createdAt: string;
    dateOfBirth: null | any;
    email: string;
    emailVerifiedAt: string;
    firstName: string;
    id: string;
    isSuperAdmin: boolean;
    isVerified: boolean;
    lastName: string;
    mobiHolderId: string;
    natureOfOrganization: string;
    phoneNumber: string;
    photo: string;
    status: string;
    updatedAt: string;
    username: string;
    wallet: string;
  };
  userId: string;
}

interface ItemProps {
  item: EventInvitesItemProps;
  navigation?: any;
  refetch: any;
}

const EventInvitesItem = ({ item, refetch }: ItemProps) => {
  const nav = useNavigation();
  const decline_mutation = useMutation({
    mutationFn: async (payload: any) => {
      let resp = await newApi.put("/api/events/invitation/respond", {
        ...payload,
      });
      return resp.data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "invitation declined",
      });
      refetch();
    },
  });
  const accept_mutation = useMutation({
    mutationFn: async (payload: any) => {
      let resp = await newApi.put("/api/events/invitation/respond", {
        ...payload,
      });
      return resp.data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "invitation accepted",
      });
      refetch();
    },
    onError: (error: AxiosError) => {
      console.log(error.response?.data);
      Toast.show({
        type: "error",
        text1: "failed",
      });
    },
  });
  const handle_accept = (item: any) => {
    if (!item.isFree) {
      return paystackWebViewRef?.current?.startTransaction();
    }
    const payload = {
      token: item.invitationToken,
      status: "Accepted",
      // refID: ref,
    };
    accept_mutation.mutate(payload);
  };
  const after_payment = (ref: string) => {
    const payload = {
      token: item.invitationToken,
      status: "Accepted",
      refID: ref,
    };
    console.log("paid");
    accept_mutation.mutate(payload);
  };
  const handle_decline = (item: any) => {
    console.log(item);
    const payload = {
      token: item.invitationToken,
      status: "Declined",
      //
    };
    decline_mutation.mutate(payload);
  };
  const { data: gateWay, isLoading: isLoadingGateway } =
    useGetPaymentGatewayQuery();
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(null);
  const payStack = gateWay?.data?.publicKey || gateWay?.data?.data?.publicKey;
  const user = useTokenStore((state) => state.userObject?.data);
  return (
    <View style={[tw` p-3  rounded-[10px] dark:bg-gray_dark bg-light`]}>
      <Paystack
        paystackKey={payStack}
        amount={item.eventtickets.price}
        billingEmail={user?.email as string}
        activityIndicatorColor="green"
        channels={["bank", "card", "ussd"]}
        onLoad={() => console.log("Paystack WebView loaded")}
        onError={(error: any) =>
          console.error("Paystack WebView error:", error)
        }
        onCancel={(e) => {
          // handle response here
        }}
        onSuccess={async (res) => {
          console.log("response", res);
          after_payment(res.data.transactionRef.reference);
        }}
        ref={paystackWebViewRef}
      />
      <View style={tw`flex-row items-center gap-1`}>
        <Image
          source={images.avatar}
          resizeMode="cover"
          style={tw`h-[15px] w-[15px] rounded-full`}
        />
        <TextPrimary
          font="montserrat_regular"
          color={colors.gray_light}
          size={8}
        >
          Frank Rose invited you to...
        </TextPrimary>
        <ImageComp image={icons.flower} size={22} style={tw`ml-auto`} />
      </View>
      <View style={tw`gap-4 flex-row items-center justify-between`}>
        <View style={tw`flex-row gap-2 items-center`}>
          <Image
            source={{ uri: item?.event?.image }}
            resizeMode="cover"
            style={tw`h-[72px]  w-[68px] rounded-[10px] `}
          />
          <View style={tw`gap-[0.5px] items-start`}>
            <TextPrimary font="montserrat_medium" size={8} color="#3F6BB9">
              EDUCATION
            </TextPrimary>
            <View style={tw`flex-row items-center  `}>
              <TextPrimary font="montserrat_medium" size={13} color="#fff">
                {item?.event?.name}
              </TextPrimary>
            </View>
            <View style={tw`flex-row items-center gap-2 `}>
              <AntDesign
                name="clockcircleo"
                size={12}
                color={colors.gray_light}
              />
              <TextPrimary
                font="montserrat_regular"
                size={13}
                color={colors.gray_light}
              >
                {moment(item?.event?.startDate).format("hh:mm A")} -{" "}
                {moment(item?.event?.endDate).format("hh:mm A")}
              </TextPrimary>
            </View>
            <View style={tw`flex-row items-center gap-2 `}>
              <FontAwesome6
                name="calendar"
                size={10}
                color={colors.gray_light}
              />
              <TextPrimary
                font="montserrat_regular"
                size={13}
                color={colors.gray_light}
              >
                {item?.event?.ticketType}
              </TextPrimary>
            </View>
          </View>
        </View>
        <View style={tw``}>
          <MaterialIcons
            name="arrow-forward-ios"
            size={15}
            style={tw`text-black dark:text-white`}
          />
        </View>
      </View>
      <View style={tw`flex-row gap-4 pt-4 border-t border-gray_light mt-4`}>
        {(item.status === "Pending" || item.status === undefined) && (
          <SmallButton
            style={tw`h-7 bg-transparent border border-red-600`}
            onPress={() => handle_decline(item)}
            disabled={accept_mutation.isPending || decline_mutation.isPending}
            isLoading={decline_mutation.isPending}
          >
            <TextPrimary
              size={9}
              font="montserrat_medium"
              style={tw`text-red-600`}
            >
              Decline
            </TextPrimary>
          </SmallButton>
        )}
        <SmallButton
          style={tw`h-7 `}
          onPress={() => {
            if (item.status != "Accepted") return handle_accept(item);
            return nav.navigate("EventDetails", { eventId: item.event.id });
          }}
          isLoading={accept_mutation.isPending}
        >
          <TextPrimary size={9} font="montserrat_medium" style={tw`text-white`}>
            {item.status == "Accepted" && "View"}
            {item.status == "Declined" && "View"}
            {item.status != "Accepted" && item.status != "Declined"
              ? item.isFree
                ? "Free"
                : "Buy Ticket"
              : null}
          </TextPrimary>
        </SmallButton>
      </View>
    </View>
  );
};

export default EventInvitesItem;

const styles = StyleSheet.create({});
