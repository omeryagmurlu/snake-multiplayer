<script lang="ts">
    import Window from "../components/Window.svelte";
    import { controls, mobileCheck, sensorCheck } from "../stores/settings";
    import { ControlTypes } from "./Game/Controls";

    const DESC: Record<ControlTypes, string> = {
        [ControlTypes.Keyboard]: 'use mouse keys to change direction',
        [ControlTypes.Swipe]: 'swipe on the screen in four directions to change direction',
        [ControlTypes.Sensor]: 'tilt the screen in four direction to change direction'
    }
    
</script>

<Window title="controls">
    <div>selected: <span class="selected">{$controls.toLowerCase()}</span></div>
    <div>{DESC[$controls]}</div>
    
    <div>available controls:</div>
    <button disabled={mobileCheck()} on:click={() => controls.set(ControlTypes.Keyboard)}>{ControlTypes.Keyboard.toLowerCase()}</button>
    <button disabled={!mobileCheck()} on:click={() => controls.set(ControlTypes.Swipe)}>{ControlTypes.Swipe.toLowerCase()}</button>
    <button disabled={!sensorCheck()} on:click={() => controls.set(ControlTypes.Sensor)}>{ControlTypes.Sensor.toLowerCase()}</button>
</Window>