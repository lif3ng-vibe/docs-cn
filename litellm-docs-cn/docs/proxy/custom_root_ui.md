import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# UI - 自定义根路径

当你想让 LiteLLM 以自定义基础路径（base url path）对外提供服务时使用，例如 `https://localhost:4000/api/v1`

:::info

需要 v1.72.3 或更高版本。

:::

代理会在启动时改写 UI 文件以适配自定义路径，因此 UI 目录必须可写。[非 root 镜像](./docker_image_security) 会把 UI 复制到 `/var/lib/litellm/ui`，该目录归运行时用户所有，所以开箱即可正常工作。如果根文件系统为只读，请将 `LITELLM_UI_PATH` 指向一个可写卷（例如 Kubernetes 的 `emptyDir`），否则代理会输出 `Cannot apply server_root_path replacements` 日志，UI 资源也无法在自定义路径下加载。

## 用法

### 1. 在 .env 中设置 `SERVER_ROOT_PATH`

在 .env 中设置 `SERVER_ROOT_PATH`，它就会被用作服务器的根路径。

```
export SERVER_ROOT_PATH="/api/v1"
```

### 2. 运行代理服务器

```shell
litellm proxy --config /path/to/config.yaml
```

启动代理后，即可通过 `http://0.0.0.0:4000/api/v1/` 访问（因为我们设置了 `SERVER_ROOT_PATH="/api/v1"`）。

### 3. 验证是否运行在正确的路径

<Image img={require('../../img/custom_root_path.png')} />

**搞定**。在自定义根路径下运行代理，只需要这些配置。


## 演示

[这里有一个演示视频](https://drive.google.com/file/d/1zqAxI0lmzNp7IJH1dxlLuKqX2xi3F_R3/view?usp=sharing)，展示如何在自定义根路径下运行代理。
