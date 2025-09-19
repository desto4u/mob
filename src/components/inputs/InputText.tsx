import {
  Image,
  ImageProps,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  FC,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { colors } from "../../utils/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import TextPrimary from "../texts/text";
import { useColorScheme } from "nativewind";
import tw from "../../lib/tailwind";

interface IInputText extends React.HTMLProps<HTMLInputElement> {
  placeholder: string;
  style?: any;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  value?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  returnKeyType?: "go" | "next" | "search" | "send" | "none";
  onSubmitEditing?: (event: { nativeEvent: { text: string } }) => void;
  icon?: ImageProps;
  iconRight?: ImageProps;
  type?: string;
  errorMessage?: any;
  onPress?: () => void;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  defaultValue?: string;
}

interface InputTextRef {
  focus: () => void;
  clear: () => void;
}

const InputText = forwardRef<InputTextRef, IInputText>((props, ref) => {
  const {
    placeholder,
    icon,
    style,
    secureTextEntry,
    onChangeText,
    value,
    autoCapitalize,
    autoCorrect,
    returnKeyType,
    onSubmitEditing,
    keyboardType,
    type,
    errorMessage,
    onPress,
    iconRight,
    editable,
    defaultValue,
    ...rest
  } = props;

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const inputRef = React.useRef<TextInput>(null);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const { colorScheme } = useColorScheme();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      inputRef.current?.clear();
    },
  }));

  return (
    <View>
      <Pressable
        onPress={onPress}
        style={[styles.inputContainer, tw`bg-light dark:bg-gray_dark`, style]}
      >
        {icon && (
          <Image
            source={typeof icon === "string" ? { uri: icon } : icon}
            resizeMode="contain"
            style={styles.icon}
          />
        )}

        <TextInput
          ref={inputRef}
          defaultValue={defaultValue}
          placeholder={placeholder ? placeholder : "Enter text"}
          style={[styles.inputText, tw`text-black dark:text-white text-base`]}
          placeholderTextColor={colorScheme == "dark" ? "white" : colors.black}
          secureTextEntry={type === "password" && !isPasswordVisible} // Toggle visibility based on state
          onChangeText={onChangeText}
          value={value}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          keyboardType={keyboardType}
          {...rest}
        />
        {iconRight && (
          <Image
            source={
              typeof iconRight === "string" ? { uri: iconRight } : iconRight
            }
            resizeMode="contain"
            style={styles.icon}
          />
        )}
        {type === "password" && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <AntDesign
              name={isPasswordVisible ? "eye" : "eyeo"}
              size={20}
              color={colors.gray_light}
            />
          </TouchableOpacity>
        )}
      </Pressable>
      {errorMessage && (
        <Text style={[tw`text-red-600 text-xs`, { fontFamily: "regular" }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  inputContainer: {
    // marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: colors.gray_light,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputText: {
    fontSize: 13,
    color: colors.black,
    height: 50,
    flex: 1, // Allow TextInput to take up available space
  },
  icon: {
    width: 15,
    height: 15,
    tintColor: colors.gray_light,
    objectFit: "contain",
  },
});

export default InputText;
