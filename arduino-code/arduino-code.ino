#include <Servo.h>

// potentiometer variables
const int potPin = A1;
int potVal = 0,
    potPrevValue = 0;

// servo variables
Servo servo;
int servoVal = 0;

void setup(){
  servo.attach(3);
  Serial.begin(9600); // 115200
//  Serial.setTimeout(50);
}

void loop(){

  potVal = analogRead(potPin);
  if(potVal != potPrevValue) {
    Serial.println(map(potVal, 0, 1023, 0, 100));  
    potPrevValue = potVal;
    Serial.flush();
  }

  if(Serial.available() > 0) {
    servoVal = Serial.parseInt();

    // fix bug
    if(Serial.available() > 0)
      Serial.read();

    servo.write(map(servoVal, 0, 180, 0, 172)); //172
  }
}