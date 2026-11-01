---
subject: Physics 9702
chapter: 24
title: Medical physics
paper: Paper 4
---

# 24 Medical physics

## 24.1 Ultrasound
- **Ultrasound**: sound waves of frequency **above 20 kHz** (medical imaging uses roughly 1–10 MHz).
- **Piezo-electric transducer**: a quartz crystal. An alternating p.d. makes the crystal vibrate (expand and contract), which produces ultrasound. Incoming ultrasound makes it vibrate and produces a p.d., so the **same transducer emits and receives**.
- **Specific acoustic impedance**: Z = ρc (density × speed of sound in the medium).
- **Intensity reflection coefficient**: **I_R/I₀ = (Z₂ − Z₁)² / (Z₂ + Z₁)²**. A large difference in Z means a large proportion is reflected.
- **Coupling gel**: applied between the transducer and the skin to remove air. Air has a very different Z from skin, so almost all of the ultrasound would otherwise be reflected at the skin.
- **Attenuation**: I = I₀ e^(−μx), where μ is the linear attenuation coefficient.
- **Producing an image (A-scan / B-scan)**: pulses are sent into the body and reflect from the boundaries between tissues. The **time delay** of each echo gives the depth (distance = speed × time / 2), and the **intensity** of the echo gives information about the boundary.
- Ultrasound is **non-ionising** and safe (e.g. for a fetus) and shows soft tissue, but it cannot pass through bone or air well.

## 24.2 X-rays
- **Production**: electrons are accelerated through a high p.d. (tens of kV) onto a **metal target** (e.g. tungsten) in an evacuated tube.
  - **Braking radiation (bremsstrahlung)**: electrons decelerate in the target and give a **continuous spectrum**. The **maximum photon energy = eV** (the minimum wavelength λ_min = hc/(eV)).
  - **Characteristic lines**: incoming electrons knock out inner-shell electrons in the target atoms; outer electrons drop into the gaps and emit photons of specific energies.
  - Over 99% of the electron energy becomes heat, so the target is cooled, e.g. a rotating anode.
- **Hardness**: higher energy (more penetrating) X-rays are produced by a higher accelerating voltage. The **intensity** is controlled by the heater (filament) current.
- **Sharpness**: depends on the size of the target spot (a smaller spot gives a sharper image). **Contrast**: the difference in darkness between tissues; it is improved by **contrast media** (e.g. barium meal), which have a high attenuation coefficient.
- **Attenuation**: I = I₀ e^(−μx). Bone attenuates much more than soft tissue.
- **CT scanning**: an X-ray tube and detectors rotate around the patient and take images of thin slices from many angles. A computer builds a **3D image** from the many 2D images. It gives better detail than a simple X-ray, but a **higher radiation dose**.

## 24.3 PET scanning
- **Tracer**: a substance containing a **β⁺-emitting radionuclide** (e.g. fluorine-18 in fluorodeoxyglucose) that is absorbed by the target tissue. Very active tissue, such as a tumour, takes up more of it.
- The positron (β⁺) meets an electron and **annihilates**: their mass becomes energy as **two gamma photons of 0.511 MeV each**, emitted in **opposite directions** (this conserves momentum).
- Energy of each photon = mₑc² (the rest mass energy of an electron, because the kinetic energy is negligible).
- A ring of detectors detects the photon pairs at the **same time**. The **difference in arrival times** locates the point of annihilation, and a computer builds a 3D image of the tracer's concentration.
- The tracer must have a **short half-life** (to limit the dose) but long enough for the scan.

## Worked example
Find the fraction of ultrasound intensity reflected at a boundary between muscle (Z = 1.70 × 10⁶) and bone (Z = 7.80 × 10⁶ kg m⁻² s⁻¹).
(7.80 − 1.70)² / (7.80 + 1.70)² = 37.2 / 90.3 = **0.41**

## Exam tips and common mistakes
- Explain the coupling gel in terms of **acoustic impedance**, not "to help it slide".
- The X-ray minimum wavelength depends **only** on the accelerating voltage.
- In PET, say the two photons are emitted in **opposite directions** with energy equal to the electron's rest mass energy.

## Quick self-check
1. Explain how a piezo-electric crystal produces ultrasound.
2. An X-ray tube operates at 80 kV. Find the minimum wavelength produced. *(1.6 × 10⁻¹¹ m)*
3. Explain why two gamma photons are produced when a positron annihilates.
