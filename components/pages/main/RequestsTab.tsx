import { View, Text } from "react-native"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { GripVerticalIcon, ChevronDownIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar"
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectItem,
  } from '@/components/ui/select';

export const RequestsTab = () => {
    return (
        <View className="flex-1 flex-col">
            <Avatar className="absolute z-10 top-1/4 left-1/2 h-[200] w-[200] mt-[-100] ml-[-100] ">
                <AvatarFallbackText>Recipient</AvatarFallbackText>
                <AvatarImage source={require('@/assets/images/placeholder-logo.png')} />
            </Avatar>
            <View className="h-1/4 bg-red-500"></View>
            <View className="flex-1 flex flex-col items-center justify-center ml-24 mr-24 gap-4">
                <Input variant="underlined" size="lg">
                    <InputIcon as={GripVerticalIcon} />
                    <InputField type='text' keyboardType="numeric" />
                    <InputSlot className="pr-3">
                    </InputSlot>
                </Input>
                <View className="w-full flex flex-row">
                    <Select className="w-1/2">
                        <SelectTrigger variant="underlined" size="lg">
                            <SelectIcon className="mr-3" as={ChevronDownIcon} />
                            <SelectInput placeholder="Select option" />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label="Placeholder" value="placeholder" />
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                    <View className="flex-1"></View>
                </View>
                <Button size="md" className="bg-green-500">
                    <ButtonText>Send</ButtonText>
                </Button>
            </View>
        </View>
    )
}