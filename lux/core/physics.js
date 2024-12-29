import * as planck from '/lux/components/planck.min.js';

export class physics {
    constructor() {
        this.world = new planck.World({
            gravity: planck.Vec2(0, 9.81)
        });
    }

    newWorld(gravityX = 0, gravityY = 9.81) {
        this.world = new planck.World({
            gravity: planck.Vec2(gravityX, gravityY)
        });
        return this.world;
    }

    newBody(x = 0, y = 0, type = 'dynamic') {
        const bodyType = {
            'static': planck.Body.STATIC,
            'dynamic': planck.Body.DYNAMIC,
            'kinematic': planck.Body.KINEMATIC
        }[type] || planck.Body.DYNAMIC;

        return this.world.createBody({
            type: bodyType,
            position: planck.Vec2(x, y)
        });
    }

    newRectangleShape(width = 1, height = 1) {
        return planck.Box(width / 2, height / 2);
    }

    newCircleShape(radius = 1) {
        return planck.Circle(radius);
    }

    newPolygonShape(vertices) {
        return planck.Polygon(vertices.map(v => planck.Vec2(v.x, v.y)));
    }

    newEdgeShape(x1, y1, x2, y2) {
        return planck.Edge(planck.Vec2(x1, y1), planck.Vec2(x2, y2));
    }

    newChainShape(vertices, loop = false) {
        const chain = planck.Chain(vertices.map(v => planck.Vec2(v.x, v.y)));
        if (loop) {
            chain.createLoop();
        }
        return chain;
    }

    newDistanceJoint(bodyA, bodyB, anchorA, anchorB) {
        return this.world.createJoint(planck.DistanceJoint({
            bodyA: bodyA,
            bodyB: bodyB,
            localAnchorA: planck.Vec2(anchorA.x, anchorA.y),
            localAnchorB: planck.Vec2(anchorB.x, anchorB.y)
        }));
    }

    newRevoluteJoint(bodyA, bodyB, x, y) {
        return this.world.createJoint(planck.RevoluteJoint({
            bodyA: bodyA,
            bodyB: bodyB,
            localAnchorA: bodyA.getLocalPoint(planck.Vec2(x, y)),
            localAnchorB: bodyB.getLocalPoint(planck.Vec2(x, y))
        }));
    }

    newPrismaticJoint(bodyA, bodyB, x, y, ax, ay) {
        return this.world.createJoint(planck.PrismaticJoint({
            bodyA: bodyA,
            bodyB: bodyB,
            localAnchorA: bodyA.getLocalPoint(planck.Vec2(x, y)),
            localAnchorB: bodyB.getLocalPoint(planck.Vec2(x, y)),
            localAxisA: planck.Vec2(ax, ay)
        }));
    }

    setMeter(scale) {
        planck.Settings.lengthUnitsPerMeter = scale;
    }

    getMeter() {
        return planck.Settings.lengthUnitsPerMeter;
    }

    update(dt) {
        this.world.step(dt);
    }
}