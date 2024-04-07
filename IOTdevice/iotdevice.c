#include <ESP8266WiFi.h>
#include "ThingSpeak.h"
#include "DHT.h"
#define LED 2 //D4
int pump=4; //D2
#define DHTPIN 5  //D1
String x=""; 
int val;
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
const char* ssid = "ayush";   // your network SSID (name)
const char* password = "12345678";   // your network password

WiFiClient  client;

unsigned long myChannelNumber = 2401895;
const char * myWriteAPIKey = "YLNEHWODURDK7BNP";

void setup()
{
  Serial.begin(9600);
  pinMode(A0, INPUT);
  pinMode(LED,OUTPUT);
  pinMode(pump,OUTPUT);
  Serial.println("DHTxx test!");
  digitalWrite(LED,LOW);
  digitalWrite(pump,HIGH);
  dht.begin();
  delay(500);
  WiFi.hostname("Plant_Monitoring");
  delay(500);
  WiFi.begin(ssid, password);
  delay(100);
  Serial.println("Connecting.........");
  delay(200);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
  ThingSpeak.begin(client);  // Initialize ThingSpeak
  delay(500);
}

void loop()
{
  val = analogRead(A0);
  int val_new = map(val,380,1024,100,0);
  if(val_new<40)
    {
      digitalWrite(LED,HIGH);
      digitalWrite(pump,LOW);
      Serial.println("Pump Starts");
      x="Pump Starts";
    }
  else
  {
    digitalWrite(LED,LOW);
    digitalWrite(pump,HIGH);
    Serial.println("Pump OFF");
    x="Pump Stoped";  
  }
  Serial.print("Soil = ");
  Serial.print(val);
  Serial.print("\t");
  Serial.print(val_new);
  Serial.println("%");
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t) )   
    {
    Serial.println("Failed to read from DHT sensor!");
    return;
    }

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.print("Attempting to connect");
      while (WiFi.status() != WL_CONNECTED)
      {
        WiFi.begin(ssid, password);
        delay(500);
        Serial.print(".");
      }
      Serial.println("\nConnected.");
    }
     Serial.println("\nConnected.");
    
    int x1 = ThingSpeak.writeField(myChannelNumber, 1,t, myWriteAPIKey);
    if (x1 == 200)
    {
      Serial.println("temperature update successful.");
    }
    else {
      Serial.println("Problem in  updating Temperature");
    }
    delay(300);
    int x2 = ThingSpeak.writeField(myChannelNumber, 2,h, myWriteAPIKey);
    if (x2 == 200)
    {
      Serial.println("Humidity update successful.");
    }
    else {
      Serial.println("Problem updating Humidity");
    }
   delay(300);
   int x3 = ThingSpeak.writeField(myChannelNumber, 3,val_new, myWriteAPIKey);
    if (x3 == 200)
    {
      Serial.println("Soil Moisture update successful.");
    }
    else {
      Serial.println("Problem in updating Soil Moisture");
    } 
  }
