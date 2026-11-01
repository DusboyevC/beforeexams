"""IGCSE Physics 0625 - topics follow the 2023-2025 / 2026-2028 syllabus sub-sections."""
TOPICS = {1:'Physical quantities and measurement',2:'Motion',3:'Mass, weight and density',4:'Forces and turning effects',
5:'Momentum',6:'Energy, work and power',7:'Pressure',8:'Kinetic particle model of matter',9:'Thermal properties and temperature',
10:'Transfer of thermal energy',11:'General properties of waves',12:'Light',13:'Electromagnetic spectrum',14:'Sound',
15:'Simple magnetism',16:'Electrical quantities',17:'Electric circuits and electrical safety',18:'Electromagnetic effects',
19:'The nuclear model of the atom',20:'Radioactivity',21:'Earth and the Solar System',22:'Stars and the Universe'}
KW = {
1:['measuring cylinder','micrometer','vernier','stopwatch','stop-watch','metre rule','ruler','scalar','vector','resultant','period of','oscillations','precision','zero error','average time','parallax'],
2:['speed','velocity','acceleration','decelerat','distance-time','distance/time','speed-time','speed/time','free fall','terminal velocity','journey','travels','gradient of the graph','area under'],
3:['mass','weight','density','gravitational field strength','balance','displacement can','overflow can','volume of','kg/m3','g/cm3','floats','sink'],
4:['force','spring','extension','limit of proportionality','load','moment ','moments','moment.','pivot','equilibrium','centre of gravity','center of gravity','friction','resultant force','newton','stability','topple','circular path','centripetal','hooke'],
5:['momentum','impulse','collision','collides','recoil'],
6:['kinetic energy','potential energy','gravitational potential','work done','power','efficiency','energy store','energy transfer','useful energy','fossil fuel','renewable','solar','wind turbine','hydroelectric','geothermal','nuclear fission','tidal','wave energy','biofuel','power station','sankey'],
7:['pressure','depth','liquid column','manometer','barometer','hydraulic','pa ','pascal','n/m2'],
8:['molecules','particles','solid','liquid','gas','brownian','smoke particles','gas pressure','boyle','evaporation','evaporat','kinetic theory','kinetic particle','absolute zero','kelvin','random motion'],
9:['thermal expansion','expands','expansion','thermometer','specific heat capacity','latent heat','melting','boiling','condensation','solidification','freezing','internal energy','temperature rise','thermocouple','sensitivity','range of the thermometer'],
10:['conduction','convection','radiation','infrared','conductor','insulator','vacuum flask','convection current','emitter','absorber','dull black','shiny','heat loss','greenhouse effect','thermal energy transfer'],
11:['wave','wavelength','frequency','amplitude','wavefront','transverse','longitudinal','ripple tank','diffraction','wave speed','crest','trough','compression','rarefaction'],
12:['reflection','refraction','refractive index','lens','converging','diverging','focal','principal focus','image','virtual','real image','critical angle','total internal reflection','optical fibre','mirror','dispersion','prism','spectrum of','ray diagram','angle of incidence','normal','magnif'],
13:['electromagnetic','radio waves','microwaves','infrared','visible light','ultraviolet','x-rays','x-ray','gamma','3.0 x 10','speed of light','analogue','digital signal','mobile phone','satellite'],
14:['sound','echo','ultrasound','pitch','loudness','loud','audible','vibrat','hz','khz','hearing','compressions'],
15:['magnet','magnetic field','north pole','south pole','induced magnetism','soft iron','steel','magnetic material','field lines','compass','attract','repel','electromagnet'],
16:['charge','electrostatic','current','ammeter','voltmeter','potential difference','p.d.','e.m.f.','resistance','ohm','resistor','resistivity','electric field','coulomb','i-v graph','i–v'],
17:['series','parallel','circuit','lamp','thermistor','light-dependent resistor','ldr','potential divider','diode','fuse','circuit breaker','earth wire','live wire','neutral','double insulation','switch','cell','battery','variable resistor','kwh','kilowatt-hour','cost of'],
18:['electromagnetic induction','induced e.m.f','induced emf','generator','a.c. generator','dynamo','transformer','primary coil','secondary coil','turns','motor','d.c. motor','split-ring','commutator','left-hand rule','solenoid','relay','loudspeaker','slip rings','magnetic effect of a current','force on a current'],
19:['nucleus','proton','neutron','electron','nucleon','proton number','nucleon number','isotope','alpha particle scattering','gold foil','atomic model','fission','fusion','nuclide'],
20:['radioactive','radioactivity','radiation','alpha','beta','gamma','half-life','half life','background radiation','decay','emission','geiger','counter','count rate','ionising','ionizing','smoke alarm','tracer','sterilis','irradiat','dose'],
21:['earth','moon','sun ','sun.','orbit','planet','solar system','day and night','seasons','axis','asteroid','comet','orbital speed','gravitational attraction','mercury','venus','mars','jupiter','saturn','uranus','neptune','tilted'],
22:['star ','stars','star.','galaxy','galaxies','milky way','light-year','light year','red giant','supergiant','white dwarf','neutron star','black hole','supernova','nebula','protostar','big bang','redshift','red-shift','hubble','cosmic microwave','universe','main sequence'],
}
STRONG = {
1:['micrometer','vernier','measuring cylinder','scalar','vector quantit','resultant of','period of','pendulum','oscillation'],2:['acceleration','speed-time graph','distance-time graph','terminal velocity'],
3:['density','gravitational field strength','weight of'],4:['moment ','moments','moment.','centre of gravity','center of gravity','stable','stability','extension','limit of proportionality','pivot','resultant force'],
5:['momentum','impulse','stays in the block','stick together'],6:['kinetic energy','gravitational potential energy','work done','energy store','average power','does work','useful output','efficiency','power station','renewable','energy resource'],
7:['pressure','force exerted on the base'],8:['brownian','molecules','gas pressure','absolute zero','gas particles','air particles','particles in a','motion of the particles','lowest possible temperature','kelvin'],9:['specific heat capacity','thermal capacity','heat capacity','latent heat','thermal expansion','thermometer','melting','boiling','evaporat','condensation','solidification'],
10:['conduction','convection','infrared radiation','thermal radiation','lattice vibrations'],11:['wavelength','wavefront','ripple tank','diffraction','transverse','longitudinal'],
12:['refraction','refractive index','critical angle','total internal reflection','lens','focal length','reflection','plane mirror'],
13:['electromagnetic spectrum','electromagnetic wave','microwaves','ultraviolet','x-rays'],14:['sound','ultrasound','echo'],
15:['magnetic field','magnetised','magnetized','bar magnet','soft iron'],16:['resistance','potential difference','electric charge','charged','electric current','ammeter','electromotive force','e.m.f.'],17:['circuit','series','parallel','potential divider','thermistor','fuse','logic gate','nand','nor gate','and gate','or gate'],
18:['transformer','electromagnetic induction','e.m.f. across','centre-zero','force on the wire','force acts on the wire','current-carrying conductor','electromagnet ','electromagnets','electromagnet.','d.c. motor','induced e.m.f','generator','motor','solenoid','relay','carrying a current','carries a current','current-carrying','magnetic effect','around a wire'],
19:['proton number','nucleon number','isotope','alpha particle scattering','nuclear fission','nuclear fusion'],
20:['half-life','half life','radioactive','background radiation','alpha','beta','gamma'],21:['orbit','solar system','planet','moon','the sun ','the sun.'],22:['galaxy','star ','stars','star.','red-shift','redshift','big bang','light-year','universe']}
def topics_allowed(base):
    _, sess, kind, num = base.split('_'); yy=int(sess[1:])
    ts=list(range(1,23)) if yy>=23 else list(range(1,21))
    return ts
