import { css } from "tss-react/@emotion/css";
import { getStoryFactory } from "stories/getStory";
import { sectionName } from "../sectionName";
import { MySecrets } from "ui/components/pages/MySecrets";
import type { Props } from "ui/components/pages/MySecrets";
import { symToStr } from "tsafe/symToStr";

type StoryProps = {
    width: number;
    height: number;
};

function Component(
    props: Omit<Props, "className" | "route" | "splashScreen"> & StoryProps,
) {
    const { width, height } = props;

    return (
        <MySecrets
            route={null as any}
            className={css({
                width,
                height,
            })}
        />
    );
}

const { meta, getStory } = getStoryFactory({
    sectionName,
    "doUseLib": true,
    "wrappedComponent": { [symToStr({ MySecrets })]: Component },
});

export default {
    ...meta,
    "argTypes": {
        ...meta.argTypes,
        "width": {
            "control": {
                "type": "range",
                "min": 200,
                "max": 1920,
            },
        },
        "height": {
            "control": {
                "type": "range",
                "min": 200,
                "max": 1080,
            },
        },
    },
};

export const Vue1 = getStory({
    "width": 1400,
    "height": 1100,
});
