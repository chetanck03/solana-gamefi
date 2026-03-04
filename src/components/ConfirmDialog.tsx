import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        {/* Dialog Box */}
        <View className="w-full max-w-md bg-[#0a0a1a] rounded-2xl border-2 border-[#2a2a3e] overflow-hidden shadow-2xl">
          {/* Header with Icon */}
          <View className="pt-8 pb-4 items-center px-6">
            <View className="w-20 h-20 rounded-full bg-[#1a1a2e] items-center justify-center border-3 border-[#FF4444] mb-4">
              <Ionicons name="warning" size={40} color="#FF4444" />
            </View>
            <Text 
              style={{ fontFamily: 'Bangers' }} 
              className="text-white text-3xl tracking-wider"
            >
              {title}
            </Text>
          </View>

          {/* Message */}
          <View className="px-6 py-4">
            <Text 
              style={{ fontFamily: 'Bangers' }} 
              className="text-[#999999] text-xl text-center leading-7"
            >
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View className="flex-row p-4 gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-[#1a1a2e] rounded-xl py-4 border-2 border-[#2a2a3e] active:bg-[#2a2a3e]"
              activeOpacity={0.8}
            >
              <Text 
                style={{ fontFamily: 'Bangers' }} 
                className="text-white text-xl text-center tracking-wider"
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-[#FF4444] rounded-xl py-4 border-2 border-[#FF4444] active:bg-[#FF3333]"
              activeOpacity={0.8}
            >
              <Text 
                style={{ fontFamily: 'Bangers' }} 
                className="text-white text-xl text-center tracking-wider"
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
