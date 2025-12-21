import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.cm as cm
import matplotlib.colors as mcolors
from matplotlib.animation import FuncAnimation

dt = 1 #seconds
t_max = 3*60*60 #3 hours
h = 8500 #scale height/H
v0 = 5.0

time = np.arange(0, t_max, dt)
altitude = np.zeros_like(time, dtype = float)

for i in range(1, len(time)):
    v = v0*np.exp(-altitude[i-1]/h)
    altitude[i] = altitude[i-1] + v*dt

    if altitude[i] > 30000:
        altitude = altitude[:i]
        time = time[:i]
        break

#radiation vs. altitude measurement model

R0 = 0.12   # µSv/hr at ground level in UAE
Hr = 7000
lat_factor = 0.85
true_radiation = lat_factor*R0*np.exp(altitude/Hr)
noise = np.random.normal(0, 0.05, size = len(true_radiation))
measured_radiation = true_radiation + noise

#3d factors (wind)
wind_speed = 10 + 0.002*altitude #in m/s
wind_direction = np.pi/4 #pi/4 rad or 45 degrees

x = np.cumsum(wind_speed*np.cos(wind_direction)*dt)
y = np.cumsum(wind_speed*np.sin(wind_direction)*dt)
z = altitude

#graphing in 3d
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.set_xlim(min(x), max(y))
ax.set_ylim(min(y), max(y))
ax.set_zlim(0, max(z))

ax.set_xlabel("East-West (m)")
ax.set_ylabel("North-South (m)")
ax.set_zlabel("Altitude (m)")

sc = ax.scatter(x, y, z,
                c = measured_radiation,
                cmap = 'plasma',
                s = 8,
                alpha = 0.0   #invisible
                )
def update(frame):
    alphas = np.zeros(len(z))
    alphas[:frame] = 1.0
    sc.set_alpha(alphas)
    return (sc,)

ani = FuncAnimation(
    fig,
    update,
    frames = range(1, len(z), 10),
    interval = 20,
    blit = False,
    repeat = False
)
cmap = cm.plasma
norm = mcolors.Normalize(vmin = min(measured_radiation), vmax = max(measured_radiation))
sm = cm.ScalarMappable(cmap = cmap, norm = norm)
sm.set_array([])
cbar = plt.colorbar(sm, ax = ax)
cbar.set_label("Radiation (µSv/hr)")

plt.show()


