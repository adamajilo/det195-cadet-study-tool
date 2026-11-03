const songText={
af:`Off we go into the wild blue yonder,
Climbing high into the sun;
Here they come, zooming to meet our thunder,
At 'em now, give 'em the gun!
Down we dive, spouting our flame from under,
Off with one helluva roar!
We live in fame or go down in flame, Hey!
Nothing'll stop the US Air Force!`,
sf:`We're the mighty watchful eye,
Guardians beyond the blue,
The invisible front line,
Warfighters brave and true.
Boldly reaching into space,
There's no limit to our sky.
Standing guard both night and day,
We're the Space Force from on high.`
};
const SONGS={};
for(const k in songText)SONGS[k]=songText[k].split("\n").map(s=>s.trim()).filter(Boolean);


