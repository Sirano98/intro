varying vec3 vNormal;
varying vec3 vCameraDirection;
uniform float uAtmosphereIntensity;
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereOpacity;

void main() {

    float intensity = pow(uAtmosphereIntensity - dot(vNormal, vCameraDirection), 2.0);
    gl_FragColor = vec4(uAtmosphereColor, uAtmosphereOpacity) * intensity;
}