// components/AnimatedSelect.tsx
import React from "react";
import Select, {
  components,
  MenuListProps,
  GroupBase,
  Props as SelectProps,
} from "react-select";
import { AnimatePresence, motion } from "framer-motion";

type DefaultOption = {
  value: string;
  label: string;
};

const Menu = <
  Option extends DefaultOption,
  IsMulti extends boolean = false
>(
  props: MenuListProps<Option, IsMulti, GroupBase<Option>>
) => {
  return (
    <AnimatePresence>
      {props.children && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="react-select__menu-list"
        >
          <components.MenuList {...props}>{props.children}</components.MenuList>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AnimatedSelect = <
  Option extends DefaultOption,
  IsMulti extends boolean = false
>(
  props: SelectProps<Option, IsMulti, GroupBase<Option>>
) => {
  return (
    <Select<Option, IsMulti, GroupBase<Option>>
      {...props}
      components={{
        ...props.components,
        MenuList: Menu, // заменяем MenuList вместо Menu!
      }}
      menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
      styles={{
        ...props.styles,
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
    />
  );
};

export default AnimatedSelect;
