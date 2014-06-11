#include <pebble.h>
#include <utils.h>

#define STEP_MS 1000

static Window *window;
static TextLayer *message_layer;
static AppTimer *timer;

enum {
  QUOTE_KEY_MESSAGE = 0x1,
  QUOTE_KEY_FETCH = 0x2,
  QUOTE_KEY_ACCEL = 0x3,
};

static void send_fetch_msg() {
  Tuplet fetch_tuple = TupletInteger(QUOTE_KEY_FETCH, 1);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &fetch_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void timer_callback(void *data) {
  send_fetch_msg();

  timer = app_timer_register(STEP_MS, timer_callback, NULL);
}

static void send_event_msg(char *message) {
  char *data;

  Tuplet message_tuple = TupletCString(QUOTE_KEY_MESSAGE, message);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &message_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void accel_data_handler(AccelData *data, uint32_t num_samples) {
  char x[5];
  char y[5];
  char z[5];
  char msg[20];
  itoa(data[0].x, x);
  itoa(data[0].y, y);
  itoa(data[0].z, z);

  strcpy(msg, x);
  strcat(msg, ",");
  strcat(msg, y);
  strcat(msg, ",");
  strcat(msg, z);

  send_event_msg(msg);
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_event_msg("select");
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_event_msg("up");
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_event_msg("down");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

static void accel_tap_handler(AccelAxisType axis, int32_t direction) {
  send_event_msg("tap");
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *message_tuple = dict_find(iter, QUOTE_KEY_MESSAGE);
  Tuple *accel_tuple   = dict_find(iter, QUOTE_KEY_ACCEL);

  if (message_tuple) {
    text_layer_set_text(message_layer, message_tuple->value->cstring);
  }

  if (accel_tuple) {
    APP_LOG(APP_LOG_LEVEL_INFO, accel_tuple->value->cstring);
    accel_service_set_sampling_rate(ACCEL_SAMPLING_25HZ);
    accel_service_set_samples_per_update(1);
    accel_data_service_subscribe(1, &accel_data_handler);
  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped!");
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}

static void app_message_init(void) {
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);
  app_message_open(APP_MESSAGE_INBOX_SIZE_MINIMUM, APP_MESSAGE_OUTBOX_SIZE_MINIMUM);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  message_layer = text_layer_create(GRect(0, 0, 150, 140));
  text_layer_set_text_color(message_layer, GColorBlack);
  text_layer_set_background_color(message_layer, GColorClear);
  text_layer_set_font(message_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(message_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(message_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(message_layer);
}

static void init(void) {
  window = window_create();
  app_message_init();
  accel_tap_service_subscribe(&accel_tap_handler);
  window_set_click_config_provider(window, click_config_provider);
  timer  = app_timer_register(STEP_MS, timer_callback, NULL);

  window_set_window_handlers(window, (WindowHandlers) {
      .load = window_load,
      .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  accel_data_service_unsubscribe();
  accel_tap_service_unsubscribe();
  window_destroy(window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}

