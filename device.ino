#include <Adafruit_NeoPixel.h>
int pinLED = 6;
Adafruit_NeoPixel strip = Adafruit_NeoPixel(12, pinLED, NEO_GRB + NEO_KHZ800);

#include <SimpleDHT.h>
int pinDHT11 = 4;
SimpleDHT11 dht11;
int pinPIR = 2;


String receivedData;
char serialEndByte = '\n';


int colorMode = 0;
bool dhtMode = false;
bool secureMode = false;

void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}

void getCurrentPIR(){
  int val = digitalRead(pinPIR);
    if(val == 1){
      Serial.print("{\"detection\":\"");
      Serial.print((int)val);
      Serial.println("\"}");
    }
    delay(1000);
}


void getCurrentDHT(){
    byte temperature = 0;
    byte humidity = 0;
    if (dht11.read(pinDHT11, &temperature, &humidity, NULL)) {
      Serial.println("Read DHT11 failed.");
      return;
    }

    Serial.print("{\"temper\":\"");
    Serial.print((int)temperature);
    Serial.print("\",\"humid\":\"");
    Serial.print((int)humidity);
    Serial.println("\"}");


    delay(1000);
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println("Hello IoT Testbed");

  pinMode(pinPIR,INPUT);
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'

}

void loop() {
  // put your main code here, to run repeatedly:
  if( Serial.available() > 0 ) {
    char character = Serial.read();
    if (character == serialEndByte) {
      Serial.print("Received: ");
      Serial.println(receivedData);
      receivedData.trim();

      int colonPosition  = receivedData.indexOf(':');
      String key = receivedData.substring(0,colonPosition);
      int value = receivedData.substring(colonPosition+1).toInt();

      if( key.equals("led") ) {
        if( value == 0) {
          colorWipe(strip.Color(0, 0, 0), 50); // Off

          Serial.print("{\"led\":\"");
          Serial.print((int)0);
          Serial.println("\"}");
        }
        else if(value == 1) {
          colorWipe(strip.Color(64, 64, 64), 50); // WHITE
          Serial.print("{\"led\":\"");
          Serial.print((int)1);
          Serial.println("\"}");
        }
        else if(value == 2) {
          colorWipe(strip.Color(0, 0, 128), 50); // BLUE
          Serial.print("{\"led\":\"");
          Serial.print((int)2);
          Serial.println("\"}");
        }
        else if(value == 3) {
          colorWipe(strip.Color(0, 128, 0), 50); // GREEN
          Serial.print("{\"led\":\"");
          Serial.print((int)3);
          Serial.println("\"}");
        }
        else if(value == 4) {
          colorWipe(strip.Color(128, 0, 0), 50); // RED
          Serial.print("{\"led\":\"");
          Serial.print((int)4);
          Serial.println("\"}");
        }
        else{
          Serial.print("{\"error\":\"unknow led value\"}");
        }
      }
      else if( key.equals("dht") ) {
        if( value == 1 ) {
          dhtMode = true;
          Serial.print("{\"dht\":\"");
          Serial.print(1);
          Serial.println("\"}");
        }
        else if( value == 0 ) {
          dhtMode = false;
          Serial.print("{\"dht\":\"");
          Serial.print(0);
          Serial.println("\"}");
        }
        else{
          Serial.print("{\"error\":\"unknown dhtmode Value\"}");
        }
      }
      else if( key.equals("secure") ){
        if( value == 1 ) {
          secureMode = true;
          Serial.print("{\"secure\":\"");
          Serial.print(1);
          Serial.println("\"}");
        }
        else if( value == 0 ) {
          secureMode=false;
          Serial.print("{\"secure\":\"");
          Serial.print(0);
          Serial.println("\"}");
        }
        else{
          Serial.print("{\"error\":\"unknow secure value\"}");
        }
      }
      else{
         Serial.print("{\"error\":\"unknow cmd\"}");
      }
      receivedData = "";
    } else {
      receivedData.concat(character); // Add the received character to the receive buffer
    }
  }

  if(secureMode){
    getCurrentPIR();
  }


  if(dhtMode){
    getCurrentDHT();
  }


}