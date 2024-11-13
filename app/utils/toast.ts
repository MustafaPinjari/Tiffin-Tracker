import { Feedback } from '@nativescript/core';

export function showToast(message: string) {
    Feedback.show({
        title: message,
        type: Feedback.Success,
        duration: 2000
    });
}