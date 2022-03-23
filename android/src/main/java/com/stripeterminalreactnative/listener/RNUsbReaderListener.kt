package com.stripeterminalreactnative.listener

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap
import com.stripe.stripeterminal.external.callable.Cancelable
import com.stripe.stripeterminal.external.callable.UsbReaderListener
import com.stripe.stripeterminal.external.models.ReaderDisplayMessage
import com.stripe.stripeterminal.external.models.ReaderInputOptions
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate
import com.stripe.stripeterminal.external.models.TerminalException
import com.stripeterminalreactnative.ReactExtensions.sendEvent
import com.stripeterminalreactnative.ReactNativeConstants
import com.stripeterminalreactnative.mapFromReaderDisplayMessage
import com.stripeterminalreactnative.mapFromReaderInputOptions
import com.stripeterminalreactnative.mapFromReaderSoftwareUpdate
import com.stripeterminalreactnative.nativeMapOf

class RNUsbReaderListener(
    private val context: ReactApplicationContext,
    private val onStartInstallingUpdate: (cancelable: Cancelable?) -> Unit,
): UsbReaderListener {
    override fun onReportAvailableUpdate(update: ReaderSoftwareUpdate) {
        context.sendEvent(ReactNativeConstants.REPORT_AVAILABLE_UPDATE.listenerName) {
            putMap("result", mapFromReaderSoftwareUpdate(update))
        }
    }

    override fun onStartInstallingUpdate(
        update: ReaderSoftwareUpdate,
        cancelable: Cancelable?
    ) {
        onStartInstallingUpdate(cancelable)
        context.sendEvent(ReactNativeConstants.START_INSTALLING_UPDATE.listenerName) {
            putMap("result", mapFromReaderSoftwareUpdate(update))
        }
    }

    override fun onReportReaderSoftwareUpdateProgress(progress: Float) {
        context.sendEvent(ReactNativeConstants.REPORT_UPDATE_PROGRESS.listenerName) {
            putMap("result", nativeMapOf {
                putString("progress", progress.toString())
            })
        }
    }

    override fun onFinishInstallingUpdate(
        update: ReaderSoftwareUpdate?,
        e: TerminalException?
    ) {
        context.sendEvent(ReactNativeConstants.FINISH_INSTALLING_UPDATE.listenerName) {
            update?.let {
                putMap("result", mapFromReaderSoftwareUpdate(update))
            } ?: run {
                putMap("result", WritableNativeMap())
            }
        }
    }

    override fun onRequestReaderInput(options: ReaderInputOptions) {
        context.sendEvent(ReactNativeConstants.REQUEST_READER_INPUT.listenerName) {
            putArray("result", mapFromReaderInputOptions(options))
        }
    }

    override fun onRequestReaderDisplayMessage(message: ReaderDisplayMessage) {
        context.sendEvent(ReactNativeConstants.REQUEST_READER_DISPLAY_MESSAGE.listenerName) {
            putString("result", mapFromReaderDisplayMessage(message))
        }
    }
}
