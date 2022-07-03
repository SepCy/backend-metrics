
//Libraries
#include <DHT.h>
#include <SoftwareSerial.h>
#include <TimeLib.h>
#include <ArduinoJson.h>
#include <Time.h>

SoftwareSerial mySerial(3, 2); //SIM800L Tx & Rx is connected to Arduino #3 & #2


#define DHTPIN 7     // what pin we're connected to
#define DHTTYPE DHT22 // DHT 22  (AM2302)
DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor for normal 16mhz Arduino
float b;
int buf[10], temp;
float hum, rain, phSoil, windSpeed, time_rc ;
const int sensor_D = 5;
const int sensor_A = A0;
const int wind_output = A5;
const int ph_output = A2;
const int val = 0; //value for storing moisture value 
const int soilMoisture = A1;//Declare a variable for the soil moisture sensor 
const int soilPower = 6;//Variable for Soil moisture Power


void setup() {
  pinMode(soilMoisture, INPUT);
  pinMode(sensor_D, INPUT);
  pinMode(wind_output,INPUT);
  pinMode(ph_output,INPUT);
  initSIM();
  pinMode(sensor_A, INPUT);
  pinMode(soilPower, OUTPUT);//Set D7 as an OUTPUT
  digitalWrite(soilPower, LOW);//Set to LOW so no power is flowing through the sensor
  Serial.begin(9600);
  dht.begin();

}
const String location = "Buea";
String collectReadings(){
 // const int max = 3;
  int i = 0; 
  String results = "";
  //for(i; i< max; i++){
    String time_rc = String(now());
    String hum = String(collectHumidity());
    String temp = String(collectTemp());
    String phSoil = String(collectPHData());
    String rain = String(collectRainData());
    String windSpeed = String(collectWindData());
    String soilMoisture = String(collectMoistureData());

    results += "{" "T: "+ time_rc + "," + temp + "," +  hum + "," +  windSpeed + "," + phSoil + "," + rain + "," +  soilMoisture + "}" "," ;
    results += "\n{" "T: "+ time_rc + "," + temp + "," + hum + "," + windSpeed + "," + phSoil + "," + rain + "," +  soilMoisture + "}" ",";
    
    // results += "{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}" "," ;
    //results += "\n{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}" ",";
        
    //results += "\n{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}";

   // results += "{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}" "," "{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}" "," "{" "Time: "+ time_rc + "," + "Temperature: "+ temp + " Celsius" "," + "Humidity: "+ hum + "%" "," + "WindSpeed: "+ windSpeed + "," + "phSoil: " + phSoil + "," + "Rain: " + rain + "," + "SoilMoisture: " + soilMoisture + "}";
    //results += "{"+ time_rc + "," + temp + " Celsius" "," + hum + "%" "," + windSpeed + "," + phSoil + "," + rain + "," + soilMoisture + "}";

    
    Serial.println();

    if(i < 2){
      results += "";
    }
    delay(3000);
    
  //}

  return "{" + location + "," + results + "}";
  //return "{" + results + "}";

}
void loop() {
  //collectHumidity();
  //collectTemp();
  //collectRainData();
  //collectWindSpeed();
  String readings = collectReadings();
  sendMessage(readings);
  delay(5000);
}


void initSIM() {
  Serial.begin(9600);
  //Begin serial communication with Arduino and SIM800L
  mySerial.begin(9600);
  Serial.println("Weather Station");
  Serial.println("Initializing...");
  mySerial.println("AT"); //Once the handshake test is successful, it will back to OK
  updateSerial();
  mySerial.println("AT+CSQ"); //Signal quality test, value range is 0-31 , 31 is the best
  updateSerial();
  mySerial.println("AT+CCID"); //Read SIM information to confirm whether the SIM is plugged
  updateSerial();
  mySerial.println("AT+CREG?"); //Check whether it has registered in the network
  updateSerial();
}

float collectWindData(){
  float data = analogRead(wind_output);
 //Serial.print("Wind Value =");
  //Serial.println(data);
  float voltage = (data/1023) * 5 ;
  /*Serial.print("Voltage =");
  Serial.print(voltage);
  Serial.println(" V");*/

  float wind_speed = mapfloat(voltage, 0.4, 4.5, 0, 45);
  Serial.print("Wind Speed =");
  Serial.print(wind_speed);
  Serial.println("m/s");
  delay (3000);
  return wind_speed;
}

float mapfloat(float x, float in_min, float in_max, float out_min, float out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


float collectPHData(){
  for (int i = 0; i < 10; i++)
  {
    buf[i] = analogRead(ph_output);
    delay(30);
  }
  for (int i = 0; i < 9; i++)
  {
    for (int j = i + 1; j < 10; j++)
    {
      if (buf[i] > buf[j])
      {
        temp = buf[i];
        buf[i] = buf[j];
        buf[j] = temp;
      }
    }
  }
float  avgValue = 0;
  for (int i = 2; i < 8; i++)
    avgValue += buf[i];
  float pHVol = (float)avgValue * 5.0 / 1024 / 6;
  float phSoil = 14 * pHVol/5;
  Serial.print("pH Value: ");
  Serial.print(phSoil);
  Serial.println();

  return phSoil;
}

float collectRainData() {
  if (digitalRead(sensor_D) == LOW)
  {
    Serial.println("Digital Rain value : wet");
    delay(10);
  }
  else
  {
    Serial.println("Digital Rain value : dry");
    delay(10);
  }
  Serial.print("Analog Rain value : ");
  Serial.println(analogRead(sensor_A));
  
  delay(3000);
  return analogRead(sensor_A);
}

float collectTemp() {
  float temp; //Stores temperature value
  temp = dht.readTemperature();
  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" Celsius");
  return temp;

  
 // delay(2000); // Delays 2 secods
}

float collectHumidity() {
  float hum;  //Stores humidity value
  hum = dht.readHumidity();
  Serial.print("\nHumidity: ");
  Serial.print(hum);
  Serial.println("% ");
  return hum;
}


float collectMoistureData(){
  float soilMoisture;  //Stores humidity value
  digitalWrite(soilPower, HIGH);//turn D6 "On"
  delay(10);//wait 10 milliseconds 
 float val = analogRead(soilMoisture);//Read the SIG value form sensor 
  digitalWrite(soilPower, LOW);//turn D6 "Off"
  Serial.print("Soil Moisture: ");
  Serial.print(val);
  Serial.println();
  return val;//send current moisture value
  delay(10);
}

void updateSerial() {
  delay(500);
  while (Serial.available())
  {
    mySerial.write(Serial.read());//Forward what Serial received to Software Serial Port
  }
  while (mySerial.available())
  {
    Serial.write(mySerial.read());//Forward what Software Serial received to Serial Port
  }
}


  void sendMessage(String reading){
    Serial.print(reading);
  
  mySerial.println("AT"); //Once the handshake test is successful, it will back to OK
  updateSerial();
  mySerial.println("AT+CMGF=1"); // Configuring TEXT mode
  updateSerial();
  mySerial.println("AT+CMGS=\"+237677038781\"");//change ZZ with country code and xxxxxxxxxxx with phone number to sms
  //mySerial.println("AT+CMGS=\"+237672006542\"");//change ZZ with country code and xxxxxxxxxxx with phone number to sms

  updateSerial();
  mySerial.print(reading); //text content
  updateSerial();
  mySerial.write(26);
}
